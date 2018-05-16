'use strict'

const cfg = require('../../lib/config')

describe('index', () => {
  const index = require('../../lib/index')

  it('should expose the `config` object', () => {
    expect(index.config.parseConfig).to.be.eq(cfg.parseConfig)
  })
})
