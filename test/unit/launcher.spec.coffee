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


  #============================================================================
  # launcher.Launcher
  #============================================================================
  describe 'Launcher', ->
    l = null

    beforeEach ->
      l = new e.Launcher 1234

    describe 'launch', ->

      it 'should start all browsers', ->
        l.launch ['Chrome', 'ChromeCanary']

        expect(mockExec).toHaveBeenCalled()
        expect(mockExec.callCount).toBe 2
        expect(mockExec.argsForCall[0][0]).toMatch /^\/usr\/bin\/google-chrome/
        expect(mockExec.argsForCall[1][0]).toMatch /^\/usr\/bin\/google-chrome-canary/


    describe 'kill', ->
      exitSpy = null

      beforeEach ->
        exitSpy = jasmine.createSpy 'onExit'

      it 'should kill all running processe', ->
        l.launch ['Chrome', 'ChromeCanary']
        l.kill()

        expect(mockExec._processes.length).toBe 2
        expect(mockExec._processes[0].kill).toHaveBeenCalled()
        expect(mockExec._processes[1].kill).toHaveBeenCalled()


      it 'should call callback when all processes killed', ->
        l.launch ['Chrome', 'ChromeCanary']
        l.kill exitSpy

        expect(exitSpy).not.toHaveBeenCalled()
        mockExec._processes[0].emit 'exit'
        expect(exitSpy).not.toHaveBeenCalled()
        mockExec._processes[1].emit 'exit'
        expect(exitSpy).toHaveBeenCalled()


      it 'should call callback even if a process had already been killed', ->
        l.launch ['Chrome', 'ChromeCanary']
        mockExec._processes[0].exitCode = 1
        mockExec._processes[1].exitCode = 0

        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


      it 'should call callback even if no browsers lanunched', ->
        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l.launch ['Chrome', 'ChromeCanary']

        expect(l.areAllCaptured()).toBe false

        l.markCaptured 1
        expect(l.areAllCaptured()).toBe false

        l.markCaptured 2
        expect(l.areAllCaptured()).toBe true
