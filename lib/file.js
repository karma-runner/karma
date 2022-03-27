'use strict'

const path = require('path')

/**
 * File object used for tracking files in `file-list.js`.
 */
class File {
  constructor (path, mtime, doNotCache, type, isBinary) {
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

    // Tri state: null means probe file for binary.
    this.isBinary = isBinary === undefined ? null : isBinary
  }

  /**
   * Detect type from the file extension.
   * @returns {string} detected file type or empty string
   */
  detectType () {
    return path.extname(this.path).slice(1)
  }

  toString () {
    return this.path
  }
}

module.exports = File
