'use strict'

const CryptoUtils = require('../../../lib/utils/crypto-utils')

describe('CryptoUtils.sha1', () => {
  it('create sha1 digest from string', () => {
    expect(CryptoUtils.sha1('Example text')).to.equal('cf3df620b86f0c9f586359136950217cb3b8c035')
  })
})
