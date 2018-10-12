'use strict'

const ValidationUtils = require('../../../lib/utils/validation-utils')

describe('ValidationUtils.isSurroundedWith', () => {
  it('returns true when text start and ends with specified value', () => {
    expect(ValidationUtils.isSurroundedWith('//Something//', '//')).to.be.true
  })

  it('returns false when text not ends with specified value', () => {
    expect(ValidationUtils.isSurroundedWith('//Something/', '//')).to.be.false
  })

  it('returns false when text not starts with specified value', () => {
    expect(ValidationUtils.isSurroundedWith('/Something//', '//')).to.be.false
  })
})
