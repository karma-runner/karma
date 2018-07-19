'use strict'

/**
 * File object used for tracking files in `file-list.js`.
 */
class File {
  constructor (path, mtime, doNotCache, type) {
    // used for serving (processed path, eg some/file.coffee -> some/file.coffee.js)
    this.path = path

    // original absolute path, id of the file
    this.originalPath = path

    // where the content is stored (processed)
    this.contentPath = path

    this.mtime = mtime
    this.isUrl = false

    this.doNotCache = doNotCache === undefined ? false : doNotCache

    this.type = type
  }

  toString () {
    return this.path
  }
}

module.exports = File
