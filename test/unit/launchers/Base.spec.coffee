describe 'launchers Base', ->
  events = require 'events'
  nodeMocks = require 'mocks'
  loadFile = nodeMocks.loadFile
  fsMock = nodeMocks.fs

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

  m = loadFile __dirname + '/../../../lib/launchers/Base.js', mocks, globals


  beforeEach ->
    mockSpawn.reset()
    mockSpawn._processes = []


  it 'should create temp directory', ->
    browser = new m.BaseBrowser 12345
    expect(mockFs.readdirSync '/tmp/testacular-12345').toBeDefined()


  describe 'flow', ->
    browser = emitter = null

    beforeEach ->
      emitter = new events.EventEmitter()
      browser = new m.BaseBrowser 12345, emitter
      browser.DEFAULT_CMD = darwin: '/usr/bin/browser'

    # the most common scenario, when everything works fine
    it 'start -> capture -> kill', ->
      killSpy = jasmine.createSpy 'kill'

      # start the browser
      browser.start 'http://localhost/?id=12345'
      expect(mockSpawn).toHaveBeenCalledWith '/usr/bin/browser', ['http://localhost/?id=12345']
      mockSpawn.reset()

      # mark captured
      browser.markCaptured()

      # kill it
      browser.kill killSpy
      expect(mockSpawn._processes[0].kill).toHaveBeenCalled()
      expect(killSpy).not.toHaveBeenCalled()

      mockSpawn._processes[0].emit 'exit', 0
      expect(mockSpawn).toHaveBeenCalledWith 'rm', ['-rf', '/tmp/testacular-12345']

      mockSpawn._processes[1].emit 'exit', 0 # rm tempdir
      expect(killSpy).toHaveBeenCalled()


    # when the browser fails to start
    it 'start -> exit', ->
      failureSpy = jasmine.createSpy 'browser_process_failure'
      killSpy = jasmine.createSpy 'kill'

      emitter.on 'browser_process_failure', failureSpy

      browser.start 'http://localhost/?id=12345'
      mockSpawn.reset()

      mockSpawn._processes[0].emit 'exit', 1
      expect(mockSpawn).toHaveBeenCalledWith 'rm', ['-rf', '/tmp/testacular-12345']
      expect(failureSpy).toHaveBeenCalledWith browser
      mockSpawn.reset()

      # killing after failure should do nothing
      # TODO(vojta): move to separate spec
      browser.kill killSpy
      expect(killSpy).not.toHaveBeenCalled()
      expect(mockSpawn).not.toHaveBeenCalledWith()

      waitsFor (-> killSpy.callCount), 'calling kill callback', 10


    # when the browser fails to get captured in given timeout
    it 'start -> timeout -> exit', ->
      failureSpy = jasmine.createSpy 'browser_process_failure'
      killSpy = jasmine.createSpy 'kill'

      browser.start 'http://localhost/?id=12345'
      emitter.on 'browser_process_failure', failureSpy

      browser.timeout()
      expect(mockSpawn._processes[0].kill).toHaveBeenCalled()
      mockSpawn.reset()

      mockSpawn._processes[0].emit 'exit', 1
      expect(mockSpawn).toHaveBeenCalledWith 'rm', ['-rf', '/tmp/testacular-12345']
      expect(failureSpy).toHaveBeenCalledWith browser
      mockSpawn.reset()

      # killing after failure should do nothing
      # TODO(vojta): move to separate spec
      browser.kill killSpy
      expect(killSpy).not.toHaveBeenCalled()
      expect(mockSpawn).not.toHaveBeenCalledWith()

      waitsFor (-> killSpy.callCount), 'calling kill callback', 10
