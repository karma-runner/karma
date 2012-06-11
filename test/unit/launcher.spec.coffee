#==============================================================================
# lib/launcher.js module
#==============================================================================
describe 'launcher', ->
  events = require 'events'
  util = require '../test-util.js'
  loadFile = require('mocks').loadFile
  m = e = mockExec = null

  beforeEach util.disableLogger

  beforeEach ->
    mockExec = jasmine.createSpy 'exec'
    mockExec._processes = []
    mockExec.andCallFake () ->
      process = new events.EventEmitter
      process.kill = jasmine.createSpy 'kill'
      process.exitCode = null
      mockExec._processes.push process
      process

    mocks =
      child_process:
        exec: mockExec
    globals =
      global: global
      process: nextTick: process.nextTick, platform: 'linux', env: TMPDIR: '/temp'

    m = loadFile __dirname + '/../../lib/launcher.js', mocks, globals
    e = m.exports

    # mock out commands
    # m.CMD.chrome = -> 'chrome-cmd'
    # m.CMD.canary = -> 'canary-cmd'


  #============================================================================
  # launcher.Launcher
  #============================================================================
  describe 'Launcher', ->

    describe 'launch', ->

      it 'should start all browsers', ->
        l = new e.Launcher 1234
        l.launch ['Chrome', 'ChromeCanary']

        expect(mockExec).toHaveBeenCalled()
        expect(mockExec.callCount).toBe 2
        expect(mockExec.argsForCall[0][0]).toBe '/usr/bin/google-chrome'
        expect(mockExec.argsForCall[1][0]).toBe '/usr/bin/google-chrome-canary'


      xit 'should pass url with port, id, tempDir', ->
        spyOn m.CMD, 'chrome'
        spyOn m.CMD, 'canary'

        l = new e.Launcher 9876

        l.launch ['chrome']
        expect(m.CMD.chrome).toHaveBeenCalledWith 'http://localhost:9876', 1, '/temp1'

        l.launch ['canary']
        expect(m.CMD.canary).toHaveBeenCalledWith 'http://localhost:9876', 2, '/temp2'


    describe 'kill', ->

      it 'should kill all running processe', ->
        l = new e.Launcher 1234
        l.launch ['Chrome', 'ChromeCanary']
        l.kill()

        expect(mockExec._processes.length).toBe 2
        expect(mockExec._processes[0].kill).toHaveBeenCalled()
        expect(mockExec._processes[1].kill).toHaveBeenCalled()


      it 'should call callback when all processes killed', ->
        spy = jasmine.createSpy 'onExit'
        l = new e.Launcher 123
        l.launch ['Chrome', 'ChromeCanary']
        l.kill spy

        expect(spy).not.toHaveBeenCalled()
        mockExec._processes[0].emit 'exit'
        expect(spy).not.toHaveBeenCalled()
        mockExec._processes[1].emit 'exit'
        expect(spy).toHaveBeenCalled()


      it 'should call callback even if a process had already been killed', ->
        spy = jasmine.createSpy 'onExit'
        l = new e.Launcher 123
        l.launch ['Chrome', 'ChromeCanary']
        mockExec._processes[0].exitCode = 1
        mockExec._processes[1].exitCode = 0

        l.kill spy
        waitsFor (-> spy.callCount), 'onExit callback', 10


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l = new e.Launcher 1234
        l.launch ['Chrome', 'ChromeCanary']

        expect(l.areAllCaptured()).toBe false

        l.markCaptured 1
        expect(l.areAllCaptured()).toBe false

        l.markCaptured 2
        expect(l.areAllCaptured()).toBe true


  describe 'chrome', ->
    iit 'should start tmp profile and pass url with id', ->
      l = new e.Launcher 1234
      l.launch ['Firefox']
