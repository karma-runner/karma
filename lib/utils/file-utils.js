'use strict'

const fs = require('graceful-fs')

const FileUtils = {
  readFile (path) {
    return fs.readFileSync(path).toString()
  },

  saveFile (path, content) {
    fs.writeFileSync(path, content)
  },

  copyFile (src, dest) {
    FileUtils.saveFile(dest, FileUtils.readFile(src))
  }
}

module.exports = FileUtils
