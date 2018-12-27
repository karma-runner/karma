'use strict'

const path = require('path')

const PatternUtils = {
  getBaseDir (pattern) {
    return pattern
      .replace(/[/\\][^/\\]*\*.*$/, '') // remove parts with *
      .replace(/[/\\][^/\\]*[!+]\(.*$/, '') // remove parts with !(...) and +(...)
      .replace(/[/\\][^/\\]*\)\?.*$/, '') || path.sep // remove parts with (...)?
  }
}

module.exports = PatternUtils
