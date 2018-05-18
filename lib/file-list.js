'use strict'

// Dependencies
// ------------

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

// Constants
// ---------

const GLOB_OPTS = {
  cwd: '/',
  follow: true,
  nodir: true,
  sync: true
}

// Helper Functions
// ----------------

const byPath = (a, b) => {
  if (a.path > b.path) return 1
  if (a.path < b.path) return -1

  return 0
}

/**
 * The List is an object for tracking all files that karma knows about
 * currently.
 */
class FileList {
  /**
   * @param {Array} patterns
   * @param {Array} excludes
   * @param {EventEmitter} emitter
   * @param {Function} preprocess
   * @param {number} autoWatchBatchDelay
   */
  constructor (patterns, excludes, emitter, preprocess, autoWatchBatchDelay) {
    // Store options
    this._patterns = patterns
    this._excludes = excludes
    this._emitter = emitter
    this._preprocess = Promise.promisify(preprocess)
    this._autoWatchBatchDelay = autoWatchBatchDelay

    // The actual list of files
    this.buckets = new Map()

    // Internal tracker if we are refreshing.
    // When a refresh is triggered this gets set
    // to the promise that `this._refresh` returns.
    // So we know we are refreshing when this promise
    // is still pending, and we are done when it's either
    // resolved or rejected.
    this._refreshing = Promise.resolve()

    // Emit the `file_list_modified` event.
    // This function is debounced to the value of `autoWatchBatchDelay`
    // to avoid reloading while files are still being modified.
    const emit = () => {
      this._emitter.emit('file_list_modified', this.files)
    }

    const debouncedEmit = _.debounce(emit, this._autoWatchBatchDelay)
    this._emitModified = (immediate) => {
      immediate ? emit() : debouncedEmit()
    }
  }

  // Private Interface
  // -----------------

  // Is the given path matched by any exclusion filter
  //
  // path - String
  //
  // Returns `undefined` if no match, otherwise the matching
  // pattern.
  _isExcluded (path) {
    return _.find(this._excludes, (pattern) => mm(path, pattern))
  }

  // Find the matching include pattern for the given path.
  //
  // path - String
  //
  // Returns the match or `undefined` if none found.
  _isIncluded (path) {
    return _.find(this._patterns, (pattern) => mm(path, pattern.pattern))
  }

  // Find the given path in the bucket corresponding
  // to the given pattern.
  //
  // path    - String
  // pattern - Object
  //
  // Returns a File or undefined
  _findFile (path, pattern) {
    if (!path || !pattern) return
    if (!this.buckets.has(pattern.pattern)) return

    return _.find(Array.from(this.buckets.get(pattern.pattern)), (file) => {
      return file.originalPath === path
    })
  }

  // Is the given path already in the files list.
  //
  // path - String
  //
  // Returns a boolean.
  _exists (path) {
    const patterns = this._patterns.filter((pattern) => mm(path, pattern.pattern))

    return !!_.find(patterns, (pattern) => this._findFile(path, pattern))
  }

  // Check if we are currently refreshing
  _isRefreshing () {
    return this._refreshing.isPending()
  }

  // Do the actual work of refreshing
  _refresh () {
    const buckets = this.buckets
    const matchedFiles = new Set()

    let promise
    promise = Promise.map(this._patterns, (patternObject) => {
      const pattern = patternObject.pattern
      const type = patternObject.type

      if (helper.isUrlAbsolute(pattern)) {
        buckets.set(pattern, new Set([new Url(pattern, type)]))
        return Promise.resolve()
      }

      const mg = new Glob(pathLib.normalize(pattern), GLOB_OPTS)
      const files = mg.found
      buckets.set(pattern, new Set())

      if (_.isEmpty(files)) {
        log.warn('Pattern "%s" does not match any file.', pattern)
        return
      }

      return Promise.map(files, (path) => {
        if (this._isExcluded(path)) {
          log.debug('Excluded file "%s"', path)
          return Promise.resolve()
        }

        if (matchedFiles.has(path)) {
          return Promise.resolve()
        }

        matchedFiles.add(path)

        const mtime = mg.statCache[path].mtime
        const doNotCache = patternObject.nocache
        const type = patternObject.type
        const file = new File(path, mtime, doNotCache, type)

        if (file.doNotCache) {
          log.debug('Not preprocessing "%s" due to nocache', pattern)
          return Promise.resolve(file)
        }

        return this._preprocess(file).then(() => {
          return file
        })
      })
        .then((files) => {
          files = _.compact(files)

          if (_.isEmpty(files)) {
            log.warn('All files matched by "%s" were excluded or matched by prior matchers.', pattern)
          } else {
            buckets.set(pattern, new Set(files))
          }
        })
    })
      .then(() => {
        if (this._refreshing !== promise) {
          return this._refreshing
        }
        this.buckets = buckets
        this._emitModified(true)
        return this.files
      })

    return promise
  }

  // Public Interface
  // ----------------

  get files () {
    const uniqueFlat = (list) => {
      return _.uniq(_.flatten(list), 'path')
    }

    const expandPattern = (p) => {
      return Array.from(this.buckets.get(p.pattern) || []).sort(byPath)
    }

    const served = this._patterns.filter((pattern) => {
      return pattern.served
    })
      .map(expandPattern)

    const lookup = {}
    const included = {}
    this._patterns.forEach((p) => {
      // This needs to be here sadly, as plugins are modifiying
      // the _patterns directly resulting in elements not being
      // instantiated properly
      if (p.constructor.name !== 'Pattern') {
        p = createPatternObject(p)
      }

      const bucket = expandPattern(p)
      bucket.forEach((file) => {
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
      served: uniqueFlat(served),
      included: _.values(included)
    }
  }

  // Reglob all patterns to update the list.
  //
  // Returns a promise that is resolved when the refresh
  // is completed.
  refresh () {
    this._refreshing = this._refresh()
    return this._refreshing
  }

  // Set new patterns and excludes and update
  // the list accordingly
  //
  // patterns - Array, the new patterns.
  // excludes - Array, the new exclude patterns.
  //
  // Returns a promise that is resolved when the refresh
  // is completed.
  reload (patterns, excludes) {
    this._patterns = patterns
    this._excludes = excludes

    // Wait until the current refresh is done and then do a
    // refresh to ensure a refresh actually happens
    return this.refresh()
  }

  // Add a new file from the list.
  // This is called by the watcher
  //
  // path - String, the path of the file to update.
  //
  // Returns a promise that is resolved when the update
  // is completed.
  addFile (path) {
    // Ensure we are not adding a file that should be excluded
    const excluded = this._isExcluded(path)
    if (excluded) {
      log.debug('Add file "%s" ignored. Excluded by "%s".', path, excluded)

      return Promise.resolve(this.files)
    }

    const pattern = this._isIncluded(path)

    if (!pattern) {
      log.debug('Add file "%s" ignored. Does not match any pattern.', path)
      return Promise.resolve(this.files)
    }

    if (this._exists(path)) {
      log.debug('Add file "%s" ignored. Already in the list.', path)
      return Promise.resolve(this.files)
    }

    const file = new File(path)
    this.buckets.get(pattern.pattern).add(file)

    return Promise.all([
      fs.statAsync(path),
      this._refreshing
    ]).spread((stat) => {
      file.mtime = stat.mtime
      return this._preprocess(file)
    })
      .then(() => {
        log.info('Added file "%s".', path)
        this._emitModified()
        return this.files
      })
  }

  // Update the `mtime` of a file.
  // This is called by the watcher
  //
  // path - String, the path of the file to update.
  //
  // Returns a promise that is resolved when the update
  // is completed.
  changeFile (path) {
    const pattern = this._isIncluded(path)
    const file = this._findFile(path, pattern)

    if (!pattern || !file) {
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
      .catch(Promise.CancellationError, () => {
        return this.files
      })
  }

  // Remove a file from the list.
  // This is called by the watcher
  //
  // path - String, the path of the file to update.
  //
  // Returns a promise that is resolved when the update
  // is completed.
  removeFile (path) {
    return Promise.try(() => {
      const pattern = this._isIncluded(path)
      const file = this._findFile(path, pattern)

      if (!pattern || !file) {
        log.debug('Removed file "%s" ignored. Does not match any file in the list.', path)
        return this.files
      }

      this.buckets.get(pattern.pattern).delete(file)

      log.info('Removed file "%s".', path)
      this._emitModified()
      return this.files
    })
  }
}

FileList.factory = function (patterns, excludes, emitter, preprocess, autoWatchBatchDelay) {
  return new FileList(patterns, excludes, emitter, preprocess, autoWatchBatchDelay)
}

FileList.factory.$inject = ['config.files', 'config.exclude', 'emitter', 'preprocess',
  'config.autoWatchBatchDelay']

module.exports = FileList
