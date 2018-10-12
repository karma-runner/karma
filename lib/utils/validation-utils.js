'use strict'

const ValidationUtils = {
  isSurroundedWith (text, value) {
    return text.startsWith(value) && text.endsWith(value)
  }
}

module.exports = ValidationUtils
