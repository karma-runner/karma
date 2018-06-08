'use strict'
const PathUtils = require('./path-utils')
const fs = require('fs')
const Promise = require('bluebird')

const BundleUtils = {
  bundleResource (inPath, outPath) {
    return new Promise((resolve, reject) => {
      require('browserify')(inPath)
        .bundle()
        .pipe(fs.createWriteStream(outPath))
        .once('finish', () => resolve())
        .once('error', (e) => reject(e))
    })
  },

  bundleResourceIfNotExist (inPath, outPath) {
    inPath = PathUtils.calculateAbsolutePath(inPath)
    outPath = PathUtils.calculateAbsolutePath(outPath)

    return fs.existsSync(outPath)
      ? Promise.resolve()
      : BundleUtils.bundleResource(inPath, outPath)
  }
}

module.exports = BundleUtils
