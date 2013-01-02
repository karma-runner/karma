#==============================================================================
# lib/launcher.js module
#==============================================================================
describe 'launcher', ->
  events = require 'events'
  util = require '../test-util.js'
  logger = require '../../lib/logger'
  loadFile = require('mocks').loadFile

  mockSpawn = jasmine.createSpy 'spawn'
  mockSpawn.andCallFake (cmd, args) ->
    process = new events.EventEmitter
    process.stderr = new events.EventEmitter
    process.kill = jasmine.createSpy 'kill'
    process.exitCode = null
    mockSpawn._processes.push process
    process

  mocks =
    child_process:
      spawn: mockSpawn
    './logger': logger
    '../logger': logger

  timeouts = [];

  globals =
    global: global
    process: nextTick: process.nextTick, platform: 'linux', env: TMPDIR: '/temp'
    setTimeout: (fn, timeout) ->
      timeouts[timeout] = fn

  m = loadFile __dirname + '/../../lib/launcher.js', mocks, globals, true
  e = m.exports

  beforeEach ->
    mockSpawn.reset()
    mockSpawn._processes = []
    timeouts = []

    # mock out id generator
    lastGeneratedId = 0
    e.Launcher.generateId = ->
      ++lastGeneratedId

    # disable logger
    logger.setLevel -1


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

        expect(mockSpawn).toHaveBeenCalled()
        expect(mockSpawn.callCount).toBe 2
        expect(mockSpawn.argsForCall[0][0]).toBe 'google-chrome'
        expect(mockSpawn.argsForCall[1][0]).toBe 'google-chrome-canary'


      it 'should allow launching a script', ->
        l.launch ['/usr/local/bin/special-browser'], 'localhost', 1234, '/'
        expect(mockSpawn).toHaveBeenCalled()
        expect(mockSpawn.argsForCall[0][0]).toBe '/usr/local/bin/special-browser'
        expect(mockSpawn.argsForCall[0][1]).toEqual ['http://localhost:1234/?id=1']

      it 'should use the non default host', ->
        l.launch ['/usr/local/bin/special-browser'], '127.0.0.1', 1234, '/'
        expect(mockSpawn).toHaveBeenCalled()
        expect(mockSpawn.argsForCall[0][0]).toBe '/usr/local/bin/special-browser'
        expect(mockSpawn.argsForCall[0][1]).toEqual ['http://127.0.0.1:1234/?id=1']


    describe 'kill', ->
      exitSpy = null

      beforeEach ->
        exitSpy = jasmine.createSpy 'onExit'

      it 'should kill all running processe', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234
        l.kill()

        expect(mockSpawn._processes.length).toBe 2
        expect(mockSpawn._processes[0].kill).toHaveBeenCalled()
        expect(mockSpawn._processes[1].kill).toHaveBeenCalled()


      it 'should call callback when all processes killed', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234
        l.kill exitSpy

        expect(exitSpy).not.toHaveBeenCalled()
        mockSpawn._processes[0].emit 'close'
        expect(exitSpy).not.toHaveBeenCalled()
        mockSpawn._processes[1].emit 'close'
        expect(exitSpy).not.toHaveBeenCalled()

        # rm temp dirs
        mockSpawn._processes[2].emit 'exit'
        mockSpawn._processes[3].emit 'exit'
        expect(exitSpy).toHaveBeenCalled()


      it 'should call callback even if a process had already been killed', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234, '/', 0, 1 # disable retry
        mockSpawn._processes[0].emit 'close', 1
        mockSpawn._processes[1].emit 'close', 1

        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


      it 'should call callback even if no browsers lanunched', ->
        l.kill exitSpy
        waitsFor (-> exitSpy.callCount), 'onExit callback', 10


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l.launch ['Chrome', 'ChromeCanary'], 'localhost', 1234

        expect(l.areAllCaptured()).toBe false

        l.markCaptured 1
        expect(l.areAllCaptured()).toBe false

        l.markCaptured 2
        expect(l.areAllCaptured()).toBe true
