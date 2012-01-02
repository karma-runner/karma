#==============================================================================
# test/mock/util.js module
#==============================================================================
describe 'mock-util', ->
  util = require './util'

  #============================================================================
  # util.randomNextTick()
  #============================================================================
  describe 'randomNextTick', ->
    nextTick = util.randomNextTick

    it 'should be async', ->
      spy = jasmine.createSpy 'nextTick callback'
      nextTick spy

      expect(spy).not.toHaveBeenCalled()
      waitsFor (-> spy.callCount), 'nextTick', 100


    it 'should call fns in random order', ->
      orderedCount = 0
      reversedCount = 0

      stressIt = ->
        log = ''
        runs ->
          nextTick -> log += 1
          nextTick -> log += 2
          nextTick -> log += 3
          nextTick -> log += 4
          waitsFor (-> log.length is 4), 'all nextTicks', 100
        runs ->
          orderedCount++ if log is '1234'
          reversedCount++ if log is '4321'

      # execute this test five times
      stressIt() for i in [1..5]
      runs ->
        expect(orderedCount).toBeLessThan 5
        expect(reversedCount).toBeLessThan 5
