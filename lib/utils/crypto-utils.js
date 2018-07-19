'use strict'

const crypto = require('crypto')

const CryptoUtils = {
  sha1 (data) {
    return crypto
      .createHash('sha1')
      .update(data)
      .digest('hex')
  }
}

module.exports = CryptoUtils
