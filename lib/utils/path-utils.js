'use strict'

const PathUtils = {
  formatPathMapping (path, line, column) {
    return path + (line ? `:${line}` : '') + (column ? `:${column}` : '')
  }
}

module.exports = PathUtils
