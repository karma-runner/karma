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
const log = require('./logger').create('filelist')
const createPatternObject = require('./config').createPatternObject

class FileList {
  constructor (patterns, excludes, emitter, preprocess, autoWatchBatchDelay) {
    this._patterns = patterns || []
    this._excludes = excludes || []
    this._emitter = emitter
    this._preprocess = Promise.promisify(preprocess)

    this.buckets = new Map()

    // A promise that is pending if and only if we are active in this.refresh_()
    this._refreshing = null

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

    let lastCompletedRefresh = this._refreshing
    lastCompletedRefresh = Promise
      .map(this._patterns, async ({ pattern, type, nocache }) => {
        if (helper.isUrlAbsolute(pattern)) {
          this.buckets.set(pattern, [new Url(pattern, type)])
          return
        }

        const mg = new Glob(pathLib.normalize(pattern), { cwd: '/', follow: true, nodir: true, sync: true })

        const files = mg.found
          .filter((path) => {
            if (this._findExcluded(path)) {
              log.debug(`Excluded file "${path}"`)
              return false
            } else if (matchedFiles.has(path)) {
              return false
            } else {
              matchedFiles.add(path)
              return true
            }
          })
          .map((path) => new File(path, mg.statCache[path].mtime, nocache, type))

        if (nocache) {
          log.debug(`Not preprocessing "${pattern}" due to nocache`)
        } else {
          await Promise.map(files, (file) => this._preprocess(file))
        }

        this.buckets.set(pattern, files)

        if (_.isEmpty(mg.found)) {
          log.warn(`Pattern "${pattern}" does not match any file.`)
        } else if (_.isEmpty(files)) {
          log.warn(`All files matched by "${pattern}" were excluded or matched by prior matchers.`)
        }
      })
      .then(() => {
        // When we return from this function the file processing chain will be
        // complete. In the case of two fast refresh() calls, the second call
        // will overwrite this._refreshing, and we want the status to reflect
        // the second call and skip the modification event from the first call.
        if (this._refreshing !== lastCompletedRefresh) {
          return this._refreshing
        }
        this._emitModified(true)
        return this.files
      })

    return lastCompletedRefresh
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
      files.sort((a, b) => {
        if (a.path > b.path) return 1
        if (a.path < b.path) return -1

        return 0
      })

      if (p.served) {
        served.push(...files)
      }

      files.forEach((file) => {
        if (lookup[file.path] && lookup[file.path].compare(p) < 0) return

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

  async addFile (path) {
    const excluded = this._findExcluded(path)
    if (excluded) {
      log.debug(`Add file "${path}" ignored. Excluded by "${excluded}".`)
      return this.files
    }

    const pattern = this._findIncluded(path)
    if (!pattern) {
      log.debug(`Add file "${path}" ignored. Does not match any pattern.`)
      return this.files
    }

    if (this._exists(path)) {
      log.debug(`Add file "${path}" ignored. Already in the list.`)
      return this.files
    }

    const file = new File(path)
    this._getFilesByPattern(pattern.pattern).push(file)

    const [stat] = await Promise.all([fs.statAsync(path), this._refreshing])
    file.mtime = stat.mtime
    await this._preprocess(file)

    log.info(`Added file "${path}".`)
    this._emitModified()
    return this.files
  }

  async changeFile (path, force) {
    const pattern = this._findIncluded(path)
    const file = this._findFile(path, pattern)

    if (!file) {
      log.debug(`Changed file "${path}" ignored. Does not match any file in the list.`)
      return Promise.resolve(this.files)
    }

    const [stat] = await Promise.all([fs.statAsync(path), this._refreshing])
    if (force || stat.mtime > file.mtime) {
      file.mtime = stat.mtime
      await this._preprocess(file)
      log.info(`Changed file "${path}".`)
      this._emitModified(force)
    }
    return this.files
  }

  async removeFile (path) {
    const pattern = this._findIncluded(path)
    const file = this._findFile(path, pattern)

    if (file) {
      helper.arrayRemove(this._getFilesByPattern(pattern.pattern), file)
      log.info(`Removed file "${path}".`)

      this._emitModified()
    } else {
      log.debug(`Removed file "${path}" ignored. Does not match any file in the list.`)
    }
    return this.files
  }
}

FileList.factory = function (config, emitter, preprocess) {
  return new FileList(config.files, config.exclude, emitter, preprocess, config.autoWatchBatchDelay)
}

FileList.factory.$inject = ['config', 'emitter', 'preprocess']

module.exports = FileList
