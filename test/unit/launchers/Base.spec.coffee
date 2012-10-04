describe 'launchers Base', ->
  events = require 'events'
  nodeMocks = require 'mocks'
  loadFile = nodeMocks.loadFile
  fsMock = nodeMocks.fs

  fakeTimer = null

  mockSpawn = jasmine.createSpy 'spawn'
  mockSpawn.andCallFake (cmd, args) ->
    process = new events.EventEmitter
    process.stderr = new events.EventEmitter
    process.kill = jasmine.createSpy 'kill'
    process.exitCode = null
    mockSpawn._processes.push process
    process

  mockFs = fsMock.create
    tmp:
      'some.file': fsMock.file()

  mocks =
    '../logger': require '../../../lib/logger'
    child_process: spawn: mockSpawn
    fs: mockFs

  globals =
    process:
      env: TMP: '/tmp'
      platform: 'darwin'
      nextTick: process.nextTick
    setTimeout: (fn, timeout) -> fakeTimer.setTimeout fn, timeout

  m = loadFile __dirname + '/../../../lib/launchers/Base.js', mocks, globals


  beforeEach ->
    fakeTimer = new jasmine.FakeTimer()

    mockSpawn.reset()
    mockSpawn._processes = []


  describe 'start', ->
    it 'should create a temp directory', ->
      browser = new m.BaseBrowser 12345
      spyOn browser, '_start'

      browser.start '/some'
      expect(mockFs.readdirSync '/tmp/testacular-12345').toBeDefined()


    it 'should not timeout if timeout = 0', ->
      browser = new m.BaseBrowser 12345, null, 0 # captureTimeout
      spyOn browser, '_start'
      spyOn browser, '_onTimeout'

      browser.start '/some'
      fakeTimer.tick 100
      expect(browser._onTimeout).not.toHaveBeenCalled()


    it 'should append id to the url', ->
      browser = new m.BaseBrowser 123
      spyOn browser, '_start'

      browser.start '/capture/url'
      expect(browser._start).toHaveBeenCalledWith '/capture/url?id=123'


  describe 'kill', ->
    it 'should just fire done if already killed', ->
      browser = new m.BaseBrowser 123, new events.EventEmitter, 0, 1 # disable retry
      browser.DEFAULT_CMD = darwin: '/usr/bin/browser'
      killSpy = jasmine.createSpy 'kill callback'

      browser.start '/some'
      mockSpawn._processes[0].emit 'close', 0 # crash the browser

      browser.kill killSpy
      expect(killSpy).not.toHaveBeenCalled() # must be async
      waitsFor (-> killSpy.callCount), 'calling kill callback', 10


  describe 'flow', ->
    browser = emitter = null

    beforeEach ->
      emitter = new events.EventEmitter()
      browser = new m.BaseBrowser 12345, emitter, 1000, 3
      browser.DEFAULT_CMD = darwin: '/usr/bin/browser'

    # the most common scenario, when everything works fine
    it 'start -> capture -> kill', ->
      killSpy = jasmine.createSpy 'kill'

      # start the browser
      browser.start 'http://localhost/'
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      mockSpawn.reset()

      # mark captured
      browser.markCaptured()

      # kill it
      browser.kill killSpy
      expect(mockSpawn._processes[0].kill).toHaveBeenCalled()
      expect(killSpy).not.toHaveBeenCalled()

      mockSpawn._processes[0].emit 'close', 0
      expect(mockSpawn).toHaveBeenCalledWith 'rm', ['-rf', '/tmp/testacular-12345']

      mockSpawn._processes[1].emit 'exit', 0 # rm tempdir
      expect(killSpy).toHaveBeenCalled()


    # when the browser fails to get captured in given timeout, it should restart
    it 'start -> timeout -> restart', ->
      failureSpy = jasmine.createSpy 'browser_process_failure'
      emitter.on 'browser_process_failure', failureSpy

      # start
      browser.start 'http://localhost/'

      # expect starting the process
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      fakeTimer.tick 1000

      # expect killing browser
      expect(browserProcess.kill).toHaveBeenCalled()
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      mockSpawn._processes[0].emit 'exit', 0 # cleanup

      # expect re-starting
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      expect(failureSpy).not.toHaveBeenCalled();


    it 'start -> timeout -> 3xrestart -> failure', ->
      failureSpy = jasmine.createSpy 'browser_process_failure'
      emitter.on 'browser_process_failure', failureSpy

      # start
      browser.start 'http://localhost/'

      # expect starting
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      fakeTimer.tick 1000

      # expect killing browser
      expect(browserProcess.kill).toHaveBeenCalled()
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      mockSpawn._processes.shift().emit 'exit', 0 # cleanup

      # expect starting
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      fakeTimer.tick 1000

      # expect killing browser
      expect(browserProcess.kill).toHaveBeenCalled()
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      mockSpawn._processes.shift().emit 'exit', 0 # cleanup

      # after two time-outs, still no failure
      expect(failureSpy).not.toHaveBeenCalled();

      # expect starting
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # timeout
      fakeTimer.tick 1000

      # expect killing browser
      expect(browserProcess.kill).toHaveBeenCalled()
      browserProcess.emit 'close', 0
      mockSpawn.reset()
      mockSpawn._processes[0].emit 'exit', 0 # cleanup

      # expect failure
      expect(failureSpy).toHaveBeenCalledWith browser
      expect(mockSpawn).not.toHaveBeenCalled()


    # when the browser fails to start, it should restart
    it 'start -> crash -> restart', ->
      failureSpy = jasmine.createSpy 'browser_process_failure'
      emitter.on 'browser_process_failure', failureSpy

      # start
      browser.start 'http://localhost/'

      # expect starting the process
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      # crash
      browserProcess.emit 'close', 1
      mockSpawn._processes.shift().emit 'exit', 0 # cleanup

      # expect re-starting
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      browserProcess = mockSpawn._processes.shift()

      expect(failureSpy).not.toHaveBeenCalled();
