#==============================================================================
# lib/logger.js module
#==============================================================================

describe 'logger', ->
  loadFile = require('mocks').loadFile
  logSpy = m = null
  
  beforeEach ->
    console.log.reset()
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

    it 'should deactivate the global color', ->
      m.setup 'INFO', false, [
        type: 'console'
        layout:
          type: 'pattern'
      ]
      
      log = m.create('testacular')
      log.on 'log', logSpy
      log.info 'info'
      
      expect(logSpy).to.have.been.calledOnce
      expect(console.log).to.have.been.calledWith 'INFO [testacular]: info'


  #============================================================================
  # create()
  #============================================================================

  describe 'create', ->
    it 'should allow global logger with default category testacular', ->
      m.setup 'DEBUG', false
      log = m.create()
      log.on 'log', logSpy
      log.info 'global msg'
      
      expect(logSpy).to.have.been.calledOnce
      event = logSpy.lastCall.args[0]
      expect(event.categoryName).to.equal 'testacular'
      expect(event.data).to.deep.equal ['global msg']

    it 'should use local level without a global configuration', ->
      m.setup()
      log = m.create 'OBJ', 'OFF'
      log.on 'log', logSpy

      log.error 'should be ignored'
      expect(logSpy).to.not.have.been.called

      logSpy.reset()
      log2 = m.create 'OBJ2', 'INFO'
      log2.on 'log', logSpy
      log2.info 'should be here'
      expect(logSpy).to.have.been.calledOnce

      