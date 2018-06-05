'use strict'
const PathUtils = require('../../../lib/utils/path-utils')
const fs = require('fs')

describe('PathUtils.calculateAbsolutePath', () => {
  it('returns absolute path from karma project relative path', () => {
    expect(fs.existsSync(PathUtils.calculateAbsolutePath('logo/banner.png'))).to.be.true
  })
})
