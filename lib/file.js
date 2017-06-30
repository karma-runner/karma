'use strict'

/**
 * File object used for tracking files in `file-list.js`.
 */
class File {
  constructor (path, mtime, doNotCache, type, appendSha) {
    // used for serving (processed path, eg some/file.coffee -> some/file.coffee.js)
    this.path = path

    // original absolute path, id of the file
    this.originalPath = path

    // where the content is stored (processed)
    this.contentPath = path

    // encodings format {[encodingType]: encodedContent}
    //   example: {gzip: <Buffer 1f 8b 08...>}
    this.encodings = Object.create(null)

    this.mtime = mtime
    this.isUrl = false

    this.doNotCache = doNotCache === undefined ? false : doNotCache

    this.type = type

    this.appendSha = appendSha === undefined ? true : appendSha
  }

  toString () {
    return this.path
  }
}

module.exports = File
