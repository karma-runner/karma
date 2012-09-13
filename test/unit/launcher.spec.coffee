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
    mockExec.andCallFake (cmd, callback) ->
      process = new events.EventEmitter
      process.kill = jasmine.createSpy 'kill'
      process.exitCode = null
      process._cmd = cmd
      process._callback = callback
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


  #============================================================================
  # launcher.Launcher
  #============================================================================
  describe 'Launcher', ->
    l = null

    beforeEach ->
      l = new e.Launcher

    describe 'launch', ->

      it 'should start all browsers', ->
        l.launch ['Chrome', 'ChromeCanary'], 1234

        expect(mockExec).toHaveBeenCalled()
        expect(mockExec.callCount).toBe 2
        expect(mockExec.argsForCall[0][0]).toMatch /^"google-chrome"/
        expect(mockExec.argsForCall[1][0]).toMatch /^"google-chrome-canary"/


      it 'should allow custom browser launcher', ->
        instance = null
        customLauncher = ->
          @start = jasmine.createSpy 'start'
          @kill = jasmine.createSpy 'kill'
          instance = @

        l.launch [customLauncher], 1234, '/_testacular_/'
        expect(instance.start).toHaveBeenCalledWith 'http://localhost:1234/_testacular_/?id=1'

        l.kill()
        expect(instance.kill).toHaveBeenCalled()


      it 'should allow launching a script', ->
        l.launch ['/usr/local/bin/special-browser'], 1234, '/'
        expect(mockExec).toHaveBeenCalled()
        expect(mockExec.argsForCall[0][0]).toBe '"/usr/local/bin/special-browser" http://localhost:1234/?id=1'


    describe 'kill', ->
      exitSpy = null

      beforeEach ->
        exitSpy = jasmine.createSpy 'onExit'

      it 'should kill all running processe', ->
        l.launch ['Chrome', 'ChromeCanary'], 1234
        l.kill()

        expect(mockExec._processes.length).toBe 2
        expect(mockExec._processes[0].kill).toHaveBeenCalled()
        expect(mockExec._processes[1].kill).toHaveBeenCalled()


      it 'should call callback when all processes killed', ->
        l.launch ['Chrome', 'ChromeCanary'], 1234
        l.kill exitSpy

        expect(exitSpy).not.toHaveBeenCalled()
        mockExec._processes[0].emit 'exit'
        expect(exitSpy).not.toHaveBeenCalled()
        mockExec._processes[1].emit 'exit'
        expect(exitSpy).not.toHaveBeenCalled()

        mockExec._processes[2]._callback()
        mockExec._processes[3]._callback()
        expect(exitSpy).toHaveBeenCalled()


      it 'should call callback even if a process had already been killed', ->
        l.launch ['Chrome', 'ChromeCanary'], 1234
        mockExec._processes[0].exitCode = 1
        mockExec._processes[1].exitCode = 0

        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


      it 'should call callback even if no browsers lanunched', ->
        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l.launch ['Chrome', 'ChromeCanary'], 1234

        expect(l.areAllCaptured()).toBe false

        l.markCaptured 1
        expect(l.areAllCaptured()).toBe false

        l.markCaptured 2
        expect(l.areAllCaptured()).toBe true
