import path = require('path')
import fs = require('graceful-fs')
import os = require('os')
import rimraf = require('rimraf')
var log = require('./logger').create('temp-dir')

var TEMP_DIR = os.tmpdir()

export function getPath(suffix) {
  return path.normalize(TEMP_DIR + suffix)
}

export function create(path) {
  log.debug('Creating temp dir at %s', path)

  try {
    fs.mkdirSync(path)
  } catch (e) {
    log.warn('Failed to create a temp dir at %s', path)
  }

  return path
}

export function remove(path, done) {
  log.debug('Cleaning temp dir %s', path)
  rimraf(path, done)
}
