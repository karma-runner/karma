'use strict'

const Promise = require('bluebird')
const mm = require('minimatch')
const Glob = require('glob').Glob
const fs = Promise.promisifyAll(require('graceful-fs'))
const pathLib = require('path')
const _ = require('lodash')

const File = require('./file')
const Url = require('./url')
const helper = require('./helper')
const log = require('./logger').create('watcher')
const createPatternObject = require('./config').createPatternObject

function byPath (a, b) {
  if (a.path > b.path) return 1
  if (a.path < b.path) return -1

  return 0
}

class FileList {
  constructor (patterns, excludes, emitter, preprocess, autoWatchBatchDelay) {
    this._patterns = patterns || []
    this._excludes = excludes || []
    this._emitter = emitter
    this._preprocess = Promise.promisify(preprocess)

    this.buckets = new Map()

    this._refreshing = Promise.resolve()

    const emit = () => {
      this._emitter.emit('file_list_modified', this.files)
    }

    const debouncedEmit = _.debounce(emit, autoWatchBatchDelay)
    this._emitModified = (immediate) => {
      immediate ? emit() : debouncedEmit()
    }
  }

  _findExcluded (path) {
    return this._excludes.find((pattern) => mm(path, pattern))
  }

  _findIncluded (path) {
    return this._patterns.find((pattern) => mm(path, pattern.pattern))
  }

  _findFile (path, pattern) {
    if (!path || !pattern) return
    return this._getFilesByPattern(pattern.pattern).find((file) => file.originalPath === path)
  }

  _exists (path) {
    return !!this._patterns.find((pattern) => mm(path, pattern.pattern) && this._findFile(path, pattern))
  }

  _getFilesByPattern (pattern) {
    return this.buckets.get(pattern) || []
  }

  _refresh () {
    const matchedFiles = new Set()

    let promise
    promise = Promise.map(this._patterns, (patternObject) => {
      const pattern = patternObject.pattern
      const type = patternObject.type

      if (helper.isUrlAbsolute(pattern)) {
        this.buckets.set(pattern, [new Url(pattern, type)])
        return Promise.resolve()
      }

      const mg = new Glob(pathLib.normalize(pattern), { cwd: '/', follow: true, nodir: true, sync: true })
      const files = mg.found
      if (_.isEmpty(files)) {
        this.buckets.set(pattern, [])
        log.warn('Pattern "%s" does not match any file.', pattern)
        return
      }

      return Promise.map(files, (path) => {
        if (this._findExcluded(path)) {
          log.debug('Excluded file "%s"', path)
          return Promise.resolve()
        }

        if (matchedFiles.has(path)) {
          return Promise.resolve()
        }

        matchedFiles.add(path)

        const file = new File(path, mg.statCache[path].mtime, patternObject.nocache, type)
        if (file.doNotCache) {
          log.debug('Not preprocessing "%s" due to nocache', pattern)
          return Promise.resolve(file)
        }

        return this._preprocess(file).then(() => file)
      })
        .then((files) => {
          files = _.compact(files)
          this.buckets.set(pattern, files)

          if (_.isEmpty(files)) {
            log.warn('All files matched by "%s" were excluded or matched by prior matchers.', pattern)
          }
        })
    })
      .then(() => {
        if (this._refreshing !== promise) {
          return this._refreshing
        }
        this._emitModified(true)
        return this.files
      })

    return promise
  }

  get files () {
    const served = []
    const included = {}
    const lookup = {}
    this._patterns.forEach((p) => {
      // This needs to be here sadly, as plugins are modifiying
      // the _patterns directly resulting in elements not being
      // instantiated properly
      if (p.constructor.name !== 'Pattern') {
        p = createPatternObject(p)
      }

      const files = this._getFilesByPattern(p.pattern)
      files.sort(byPath)
      if (p.served) {
        served.push.apply(served, files) // TODO: replace with served.push(...files) after remove Node 4 support
      }

      files.forEach((file) => {
        const other = lookup[file.path]
        if (other && other.compare(p) < 0) return

        lookup[file.path] = p
        if (p.included) {
          included[file.path] = file
        } else {
          delete included[file.path]
        }
      })
    })

    return {
      served: _.uniq(served, 'path'),
      included: _.values(included)
    }
  }

  refresh () {
    this._refreshing = this._refresh()
    return this._refreshing
  }

  reload (patterns, excludes) {
    this._patterns = patterns || []
    this._excludes = excludes || []

    return this.refresh()
  }

  addFile (path) {
    const excluded = this._findExcluded(path)
    if (excluded) {
      log.debug('Add file "%s" ignored. Excluded by "%s".', path, excluded)
      return Promise.resolve(this.files)
    }

    const pattern = this._findIncluded(path)
    if (!pattern) {
      log.debug('Add file "%s" ignored. Does not match any pattern.', path)
      return Promise.resolve(this.files)
    }

    if (this._exists(path)) {
      log.debug('Add file "%s" ignored. Already in the list.', path)
      return Promise.resolve(this.files)
    }

    const file = new File(path)
    this._getFilesByPattern(pattern.pattern).push(file)

    return Promise.all([
      fs.statAsync(path),
      this._refreshing
    ])
      .spread((stat) => {
        file.mtime = stat.mtime
        return this._preprocess(file)
      })
      .then(() => {
        log.info('Added file "%s".', path)
        this._emitModified()
        return this.files
      })
  }

  changeFile (path) {
    const pattern = this._findIncluded(path)
    const file = this._findFile(path, pattern)

    if (!file) {
      log.debug('Changed file "%s" ignored. Does not match any file in the list.', path)
      return Promise.resolve(this.files)
    }

    return Promise.all([
      fs.statAsync(path),
      this._refreshing
    ]).spread((stat) => {
      if (stat.mtime <= file.mtime) throw new Promise.CancellationError()

      file.mtime = stat.mtime
      return this._preprocess(file)
    })
      .then(() => {
        log.info('Changed file "%s".', path)
        this._emitModified()
        return this.files
      })
      .catch(Promise.CancellationError, () => this.files)
  }

  removeFile (path) {
    return Promise.try(() => {
      const pattern = this._findIncluded(path)
      const file = this._findFile(path, pattern)

      if (file) {
        helper.arrayRemove(this._getFilesByPattern(pattern.pattern), file)
        log.info('Removed file "%s".', path)

        this._emitModified()
      } else {
        log.debug('Removed file "%s" ignored. Does not match any file in the list.', path)
      }
      return this.files
    })
  }
}

FileList.factory = function (config, emitter, preprocess) {
  return new FileList(config.files, config.exclude, emitter, preprocess, config.autoWatchBatchDelay)
}

FileList.factory.$inject = ['config', 'emitter', 'preprocess']

module.exports = FileList
