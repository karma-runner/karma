#==============================================================================
# lib/launcher.js module
#==============================================================================
describe 'launcher', ->
  events = require '../../lib/events'
  logger = require '../../lib/logger'
  loadFile = require('mocks').loadFile

  mockSpawn = sinon.spy (cmd, args) ->
    process = new events.EventEmitter
    process.stderr = new events.EventEmitter
    process.kill = sinon.spy()
    process.exitCode = null
    mockSpawn._processes.push process
    process

  mockRimraf = sinon.spy (p, fn) ->
    mockRimraf._callbacks.push fn

  mocks =
    child_process:
      spawn: mockSpawn
    './logger': logger
    '../logger': logger
    rimraf: mockRimraf

  timeouts = [];

  globals =
    global: global
    process:
      nextTick: process.nextTick
      platform: 'linux'
      env: TMPDIR: '/temp'
    setTimeout: timer.setTimeout

  m = loadFile __dirname + '/../../lib/launcher.js', mocks, globals, true
  e = m.exports

  beforeEach ->
    mockSpawn.reset()
    mockSpawn._processes = []
    mockRimraf.reset()
    mockRimraf._callbacks = []
    timeouts = []

    # mock out id generator
    lastGeneratedId = 0
    e.Launcher.generateId = ->
      ++lastGeneratedId

    # disable logger
    logger.setup 'OFF'


  #============================================================================
  # launcher.Launcher
  #============================================================================
  describe 'Launcher', ->
    l = emitter = null

    beforeEach ->
      emitter = new events.EventEmitter()
      l = new e.Launcher emitter

    describe 'launch', ->

      it 'should start all browsers', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234

        expect(mockSpawn).to.have.been.calledTwice
        expect(mockSpawn.getCall(0).args[0]).to.equal 'google-chrome'
        expect(mockSpawn.getCall(1).args[0]).to.equal 'google-chrome-canary'


      it 'should allow launching a script', ->
        l.launch ['/usr/local/bin/special-browser'], 'localhost', 1234, '/'
        expect(mockSpawn).to.have.been.calledWith '/usr/local/bin/special-browser', ['http://localhost:1234/?id=1']


      it 'should use the non default host', ->
        l.launch ['/usr/local/bin/special-browser'], '127.0.0.1', 1234, '/'
        expect(mockSpawn).to.have.been.calledWith '/usr/local/bin/special-browser', ['http://127.0.0.1:1234/?id=1']


    describe 'kill', ->
      exitSpy = null

      beforeEach ->
        exitSpy = sinon.spy()

      it 'should kill all running processe', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234
        l.kill()

        expect(mockSpawn._processes.length).to.equal 2
        expect(mockSpawn._processes[0].kill).to.have.been.called
        expect(mockSpawn._processes[1].kill).to.have.been.called


      it 'should call callback when all processes killed', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234
        l.kill exitSpy

        expect(exitSpy).not.to.have.been.called
        mockSpawn._processes[0].emit 'close'
        expect(exitSpy).not.to.have.been.called
        mockSpawn._processes[1].emit 'close'
        expect(exitSpy).not.to.have.been.called

        # rm temp dirs
        expect(mockRimraf).to.have.been.calledTwice
        mockRimraf._callbacks[0]()
        mockRimraf._callbacks[1]()
        expect(exitSpy).to.have.been.called


      it 'should call callback even if a process had already been killed', (done) ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234, '/', 0, 1 # disable retry
        mockSpawn._processes[0].emit 'close', 1
        mockSpawn._processes[1].emit 'close', 1

        l.kill done


      it 'should call callback even if no browsers lanunched', (done) ->
        l.kill done


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234

        expect(l.areAllCaptured()).to.equal  false

        l.markCaptured 1
        expect(l.areAllCaptured()).to.equal  false

        l.markCaptured 2
        expect(l.areAllCaptured()).to.equal  true


    describe 'onExit', ->

      it 'should kill all browsers', (done) ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234, '/', 0, 1

        emitter.emitAsync('exit').then done

        expect(mockSpawn._processes[0].kill).to.have.been.called
        expect(mockSpawn._processes[1].kill).to.have.been.called

        mockSpawn._processes[0].emit 'close', 0
        mockSpawn._processes[1].emit 'close', 0

        # rm temp dir
        mockRimraf._callbacks[0]()
        mockRimraf._callbacks[1]()

