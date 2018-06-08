'use strict'

const path = require('path')

const PathUtils = {
  formatPathMapping (path, line, column) {
    return path + (line ? `:${line}` : '') + (column ? `:${column}` : '')
  },

  calculateAbsolutePath (karmaRelativePath) {
    return path.join(__dirname, '..', '..', karmaRelativePath)
  }

}

module.exports = PathUtils
