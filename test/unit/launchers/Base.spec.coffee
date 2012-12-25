describe 'launchers Base', ->
  events = require 'events'
  nodeMocks = require 'mocks'
  loadFile = nodeMocks.loadFile
  fsMock = nodeMocks.fs
  path = require 'path'

  fakeTimer = null
  
  mockSpawn = sinon.spy (cmd, args) ->
    process = new events.EventEmitter
    process.stderr = new events.EventEmitter
    process.kill = sinon.spy()
    process.exitCode = null
    mockSpawn._processes.push process
    process

  
  mockRimraf = sinon.spy (p, fn) ->
    mockRimraf._callbacks.push fn

  mockFs = fsMock.create
    tmp:
      'some.file': fsMock.file()

  mocks =
    '../logger': require '../../../lib/logger'
    child_process: spawn: mockSpawn
    rimraf: mockRimraf
    fs: mockFs

  globals =
    process:
      platform: 'darwin'
      env:
        TMP: '/tmp'
      nextTick: process.nextTick
    setTimeout: timer.setTimeout
 

  m = loadFile __dirname + '/../../../lib/launchers/Base.js', mocks, globals
  

  beforeEach ->
    mockSpawn.reset()
    mockSpawn._processes = []
    mockRimraf.reset()
    mockRimraf._callbacks = []

  describe 'start', ->
    it 'should create a temp directory', ->
      browser = new m.BaseBrowser 12345
      sinon.stub browser, '_start'

      browser.start '/some'
      expect(mockFs.readdirSync '/tmp/testacular-12345').to.exist


    it 'should not timeout if timeout = 0', ->
      browser = new m.BaseBrowser 12345, null, 0 # captureTimeout
      sinon.stub browser, '_start'
      sinon.stub browser, '_onTimeout'

      browser.start '/some'
      expect(timer.setTimeout).not.to.have.been.called
      expect(browser._onTimeout).not.to.have.been.called


    it 'should append id to the url', ->
      browser = new m.BaseBrowser 123
      sinon.stub browser, '_start'

      browser.start '/capture/url'
      expect(browser._start).to.have.been.calledWith '/capture/url?id=123'


  describe 'kill', ->
    it 'should just fire done if already killed', (done) ->
      browser = new m.BaseBrowser 123, new events.EventEmitter, 0, 1 # disable retry
      browser.DEFAULT_CMD = darwin: '/usr/bin/browser'
      killSpy = sinon.spy done

      browser.start '/some'
      mockSpawn._processes[0].emit 'close', 0 # crash the browser

      browser.kill killSpy
      expect(killSpy).not.to.have.been.called # must be async


  describe 'flow', ->
    browser = emitter = null

    beforeEach ->
      emitter = new events.EventEmitter()
      browser = new m.BaseBrowser 12345, emitter, 1000, 3
      browser.DEFAULT_CMD = darwin: '/usr/bin/browser'

    # the most common scenario, when everything works fine
    it 'start -> capture -> kill', ->
      killSpy = sinon.spy()

      # start the browser
      browser.start 'http://localhost/'
      expect(mockSpawn).to.have.been.calledWith path.normalize('/usr/bin/browser'), ['http://localhost/?id=12345']
      mockSpawn.reset()

      # mark captured
      browser.markCaptured()

      # kill it
      browser.kill killSpy
      expect(mockSpawn._processes[0].kill).to.have.been.called
      expect(killSpy).not.to.have.been.called

      mockSpawn._processes[0].emit 'close', 0
      expect(mockRimraf).to.have.been.calledWith path.normalize('/tmp/testacular-12345'), killSpy

      mockRimraf._callbacks[0]() # rm tempdir
      expect(killSpy).to.have.been.called


    # when the browser fails to get captured in given timeout, it should restart
    it 'start -> timeout -> restart', ->
      failureSpy = sinon.spy()
      emitter.on 'browser_process_failure', failureSpy

      # start
      browser.start 'http://localhost/'

      # expect starting the process
      expect(mockSpawn).to.have.been.calledWith path.normalize('/usr/bin/browser'), ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      expect(timer.setTimeout).to.have.been.called
  
      # expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      expect(mockRimraf).to.be.calledOnce
      mockRimraf._callbacks[0]() # cleanup

      # expect re-starting
      expect(mockSpawn).to.have.been.calledWith path.normalize('/usr/bin/browser'), ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      expect(failureSpy).not.to.have.been.called;


    it 'start -> timeout -> 3xrestart -> failure', ->
      failureSpy = sinon.spy()
      emitter.on 'browser_process_failure', failureSpy
      normalized = path.normalize('/usr/bin/browser')

      # start
      browser.start 'http://localhost/'

      # expect starting
      expect(mockSpawn).to.have.been.calledWith normalized, ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      expect(timer.setTimeout).to.have.been.called

      # expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      expect(mockRimraf).to.have.been.calledOnce
      mockRimraf._callbacks.shift()() # cleanup
      mockRimraf.reset()

      # expect starting
      expect(mockSpawn).to.have.been.calledWith normalized, ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      expect(timer.setTimeout).to.have.been.called

      # expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      expect(mockRimraf).to.have.been.calledOnce
      mockRimraf._callbacks.shift()() # cleanup
      mockRimraf.reset()

      # after two time-outs, still no failure
      expect(failureSpy).not.to.have.been.called;

      # expect starting
      expect(mockSpawn).to.have.been.calledWith normalized, ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      expect(timer.setTimeout).to.have.been.called

      # expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      expect(mockRimraf).to.have.been.calledOnce
      mockRimraf._callbacks.shift()() # cleanup
      mockRimraf.reset()

      # expect failure
      expect(failureSpy).to.have.been.calledWith browser
      expect(mockSpawn).not.to.have.been.called


    # when the browser fails to start, it should restart
    it 'start -> crash -> restart', ->
      failureSpy = sinon.spy()
      emitter.on 'browser_process_failure', failureSpy
      normalized = path.normalize('/usr/bin/browser')

      # start
      browser.start 'http://localhost/'

      # expect starting the process
      expect(mockSpawn).to.have.been.calledWith normalized, ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # crash
      browserProcess.emit 'close', 1
      expect(mockRimraf).to.have.been.calledOnce
      mockRimraf._callbacks[0]() # cleanup

      # expect re-starting
      expect(mockSpawn).to.have.been.calledWith normalized, ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      expect(failureSpy).not.to.have.been.called;
