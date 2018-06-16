'use strict'

const path = require('path')
const fs = require('graceful-fs')
const rimraf = require('rimraf')
const log = require('./logger').create('temp-dir')

const TEMP_DIR = require('os').tmpdir()

module.exports = {
  getPath (suffix) {
    return path.normalize(TEMP_DIR + suffix)
  },

  create (path) {
    log.debug(`Creating temp dir at ${path}`)

    try {
      fs.mkdirSync(path)
    } catch (e) {
      log.warn(`Failed to create a temp dir at ${path}`)
    }

    return path
  },

  remove (path, done) {
    log.debug(`Cleaning temp dir ${path}`)
    rimraf(path, done)
  }
}
