var cfg = require('../../lib/config')

describe('index', () => {
  var index = require('../../lib/index')

  it('should expose the `config` object', () => {
    expect(index.config.parseConfig).to.be.eq(cfg.parseConfig)
  })
})
