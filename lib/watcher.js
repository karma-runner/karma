'use strict'

const chokidar = require('chokidar')
const mm = require('minimatch')
const expandBraces = require('expand-braces')

const helper = require('./helper')
const log = require('./logger').create('watcher')

const DIR_SEP = require('path').sep

function baseDirFromPattern (pattern) {
  return pattern
    .replace(/[/\\][^/\\]*\*.*$/, '') // remove parts with *
    .replace(/[/\\][^/\\]*[!+]\(.*$/, '') // remove parts with !(...) and +(...)
    .replace(/[/\\][^/\\]*\)\?.*$/, '') || DIR_SEP // remove parts with (...)?
}

function watchPatterns (patterns, watcher) {
  let pathsToWatch = new Set()

  // expand ['a/{b,c}'] to ['a/b', 'a/c']
  expandBraces(patterns)
    .forEach((path) => pathsToWatch.add(baseDirFromPattern(path)))

  pathsToWatch = Array.from(pathsToWatch)
  // watch only common parents, no sub paths
  pathsToWatch.forEach((path) => {
    if (!pathsToWatch.some((p) => p !== path && path.startsWith(p + DIR_SEP))) {
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

exports.watch = function (patterns, excludes, fileList, usePolling, emitter) {
  const watchedPatterns = getWatchedPatterns(patterns)

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

exports.watch.$inject = [
  'config.files',
  'config.exclude',
  'fileList',
  'config.usePolling',
  'emitter'
]
