// File
// ====
//
// File object used for tracking files in `file-list.js`

// Dependencies
// ------------

var _ = require('lodash')

// Constructor
var File = function (path, mtime, doNotCache, appendSha) {
  // used for serving (processed path, eg some/file.coffee -> some/file.coffee.js)
  this.path = path

  // original absolute path, id of the file
  this.originalPath = path

  // where the content is stored (processed)
  this.contentPath = path

  this.mtime = mtime
  this.isUrl = false

  this.doNotCache = _.isUndefined(doNotCache) ? false : doNotCache
  this.appendSha = _.isUndefined(appendSha) ? true : appendSha
}

File.prototype.toString = function () {
  return this.path
}

// PUBLIC
module.exports = File
