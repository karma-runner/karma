'use strict'

const mm = require('minimatch')
const expandBraces = require('expand-braces')
const PatternUtils = require('./utils/pattern-utils')

const helper = require('./helper')
const log = require('./logger').create('watcher')

const DIR_SEP = require('path').sep

function watchPatterns (patterns, watcher) {
  expandBraces(patterns) // expand ['a/{b,c}'] to ['a/b', 'a/c']
    .map(PatternUtils.getBaseDir)
    .filter((path, index, paths) => paths.indexOf(path) === index) // filter unique values
    .forEach((path, index, paths) => {
      if (!paths.some((p) => path.startsWith(p + DIR_SEP))) {
        watcher.add(path)
        log.debug(`Watching "${path}"`)
      }
    })
}

function checkAnyPathMatch (patterns, path) {
  return patterns.some((pattern) => mm(path, pattern, {dot: true}))
}

function createIgnore (patterns, excludes) {
  return function (path, stat) {
    if (stat && !stat.isDirectory()) {
      return !checkAnyPathMatch(patterns, path) || checkAnyPathMatch(excludes, path)
    } else {
      return false
    }
  }
}

function getWatchedPatterns (patterns) {
  return patterns
    .filter((pattern) => pattern.watched)
    .map((pattern) => pattern.pattern)
}

function watch (patterns, excludes, fileList, usePolling, emitter) {
  const watchedPatterns = getWatchedPatterns(patterns)
  // Lazy-load 'chokidar' to make the dependency optional. This is desired when
  // third-party watchers are in use.
  const chokidar = require('chokidar')
  const watcher = new chokidar.FSWatcher({
    usePolling: usePolling,
    ignorePermissionErrors: true,
    ignoreInitial: true,
    ignored: createIgnore(watchedPatterns, excludes)
  })

  watchPatterns(watchedPatterns, watcher)

  watcher
    .on('add', (path) => fileList.addFile(helper.normalizeWinPath(path)))
    .on('change', (path) => fileList.changeFile(helper.normalizeWinPath(path)))
    .on('unlink', (path) => fileList.removeFile(helper.normalizeWinPath(path)))
    .on('error', log.debug.bind(log))

  emitter.on('exit', (done) => {
    watcher.close()
    done()
  })

  return watcher
}

watch.$inject = [
  'config.files',
  'config.exclude',
  'fileList',
  'config.usePolling',
  'emitter'
]

module.exports = watch
