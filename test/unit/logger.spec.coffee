#==============================================================================
# lib/logger.js module
#==============================================================================

describe 'logger', ->
  loadFile = require('mocks').loadFile
  logSpy = m = null
  beforeEach ->
    logSpy = sinon.spy()
    m = loadFile __dirname + '/../../lib/logger.js'

  #============================================================================
  # setup()
  #============================================================================
  describe 'setup', ->
    it 'should allow for configuration via setup() using an array', ->
      m.setup 'INFO', true, [
        type: 'file'
        filename: 'test/unit/test.log'
      ]

      expect(m.log4js.appenders).to.have.keys ['console', 'file']
