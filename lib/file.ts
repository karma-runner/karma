// File
// ====
//
// File object used for tracking files in `file-list.js`

// Dependencies
// ------------

import _ = require('lodash')

// Constructor
export class File {
  originalPath
  contentPath
  isUrl
  sourceMap

  constructor(public path, public mtime?, public doNotCache = false) {
    // used for serving (processed path, eg some/file.coffee -> some/file.coffee.js)

    // original absolute path, id of the file
    this.originalPath = path

    // where the content is stored (processed)
    this.contentPath = path

    this.isUrl = false

  }

  toString() {
    return this.path
  }
}