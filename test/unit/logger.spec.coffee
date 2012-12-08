#==============================================================================
# lib/logger.js module
#==============================================================================
describe 'logger', ->
  logger = require '../../lib/logger'
  
  beforeEach ->
    console.log.reset()
    logger.setLevel 4 # set to DEBUG
    logger.useColors false

  it 'should have error method', ->
    logger.create('FAKE').error 'whatever'
    expect(console.log).to.have.been.calledWith 'error (FAKE): whatever'


  it 'should have warn method', ->
    logger.create('OBJECT').warn 'whatever', 'more'
    expect(console.log).to.have.been.calledWith 'warn (OBJECT): whatever more'


  it 'should have info method', ->
    logger.create('OBJECT').info 'some', 'info'
    expect(console.log).to.have.been.calledWith 'info (OBJECT): some info'


  it 'should have debug method', ->
      logger.create('OBJECT').debug 'some', 'info'
      expect(console.log).to.have.been.calledWith 'debug (OBJECT): some info'


  it 'should allow global logger without name', ->
    logger.create().info 'global msg'
    expect(console.log).to.have.been.calledWith 'info: global msg'


  it 'should allow global configuration', ->
    log = logger.create 'OBJ'

    logger.setLevel 1 # ERROR
    log.warn 'ok'
    expect(console.log).not.to.have.been.called

    console.log.reset()
    logger.setLevel 1 # ERROR
    log.debug 'should be ignored'
    expect(console.log).not.to.have.been.called


  it 'per instance configuration should override global configuration', ->
    logger.setLevel 1 # ERROR
    instance = logger.create('OBJ', 4) # DEBUG

    instance.debug 'message'
    expect(console.log).to.have.been.calledWith 'debug (OBJ): message'

    console.log.reset()
    another = logger.create('ANOTHER') # use global
    another.debug 'should be ignored'
    expect(console.log).not.to.have.been.called


  it 'per instance conf should override global even if its 0', ->
    logger.setLevel 4 # DEBUG
    instance = logger.create('OBJ', 0) # RESULT

    instance.debug 'should be ignored'
    instance.info 'should be ignored'
    instance.warn 'should be ignored'
    expect(console.log).not.to.have.been.called

  it 'should do formatting', ->
    instance = logger.create ''
    instance.info 'Int %d Str "%s"', 10, 'abc'

    expect(console.log).to.have.been.calledWith 'info: Int 10 Str "abc"'
