#==============================================================================
# test/mock/util.js module
#==============================================================================
describe 'mock-util', ->
  util = require './util'

  #============================================================================
  # util.predictableNextTick()
  #============================================================================
  describe 'predictableNextTick', ->
    nextTick = util.predictableNextTick

    it 'should be async', ->
      spy = jasmine.createSpy 'nextTick callback'
      nextTick spy

      expect(spy).not.toHaveBeenCalled()
      waitsFor (-> spy.callCount), 'nextTick', 100


    it 'should behave predictable based on given pattern', ->
      util.predictableNextTickPattern = [1, 0]
      stressIt = ->
        log = ''
        runs ->
          nextTick -> log += 1
          nextTick -> log += 2
          nextTick -> log += 3
          nextTick -> log += 4
          waitsFor (-> log.length is 4), 'all nextTicks', 100
        runs ->
          expect(log).toBe '2143'

      # execute this test five times
      stressIt() for i in [1..5]


    it 'should do 021 pattern k*n fns', ->
      util.predictableNextTickPattern = [0, 2, 1]
      log = ''
      nextTick -> log += 0
      nextTick -> log += 1
      nextTick -> log += 2
      nextTick -> log += 3
      nextTick -> log += 4
      nextTick -> log += 5
      waitsFor (-> log.length is 6), 'all nextTicks', 100
      runs ->
        expect(log).toBe '021354'


    it 'should do 3021 pattern with n+1 fns', ->
      util.predictableNextTickPattern = [3, 0, 2, 1]
      log = ''
      nextTick -> log += 0
      nextTick -> log += 1
      nextTick -> log += 2
      nextTick -> log += 3
      nextTick -> log += 4
      waitsFor (-> log.length is 5), 'all nextTicks', 100
      runs ->
        expect(log).toBe '30214'


    # regression
    it 'should survive exception inside callback', ->
      exceptionHandled = false
      beforeExceptionSpy = jasmine.createSpy 'before exception'
      afterExceptionSpy = jasmine.createSpy 'after exception'

      nextTick beforeExceptionSpy
      nextTick -> throw 'CALLBACK EXCEPTION'
      nextTick afterExceptionSpy

      uncaughtExceptionHandler = (err) ->
        process.removeListener 'uncaughtException', uncaughtExceptionHandler
        exceptionHandled = true

      process.on 'uncaughtException', uncaughtExceptionHandler
      waitsFor (-> afterExceptionSpy.callCount), 'after exception callback', 100
      runs ->
        expect(beforeExceptionSpy.callCount).toBe 1
        expect(afterExceptionSpy.callCount).toBe 1
        expect(exceptionHandled).toBe true


    # regression
    it 'should not ignore fn that was added into already skipped space during execution', ->
      util.predictableNextTickPattern = [1, 0]
      anotherCallback = jasmine.createSpy 'another later added fn'
      callback = jasmine.createSpy 'later added fn'

      nextTick ->
        nextTick ->
          callback()
          nextTick anotherCallback

      waitsFor (-> callback.callCount), 'later added fn to be called', 100
      waitsFor (-> anotherCallback.callCount), 'another later added fn to be called', 100
