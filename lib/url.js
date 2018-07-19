'use strict'

/**
 * Url object used for tracking files in `file-list.js`.
 */
class Url {
  constructor (path, type) {
    this.path = path
    this.type = type
    this.isUrl = true
  }

  toString () {
    return this.path
  }
}

module.exports = Url
