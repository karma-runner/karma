#==============================================================================
# lib/events.js module
#==============================================================================
describe 'events', ->
  e = require '../../lib/events'
  emitter = null

  beforeEach ->
    emitter = new e.EventEmitter

  #============================================================================
  # events.EventEmitter
  #============================================================================
  describe 'EventEmitter', ->

    it 'should emit events', ->
      spy = jasmine.createSpy 'listener'


      emitter.on 'abc', spy
      emitter.emit 'abc'
      expect(spy).toHaveBeenCalled()


    describe 'bind', ->
      object = null

      beforeEach ->
        object = jasmine.createSpyObj 'object', ['onFoo', 'onFooBar', 'foo', 'bar']
        emitter.bind object


      it 'should register all "on" methods to events', ->
        emitter.emit 'foo'
        expect(object.onFoo).toHaveBeenCalled()

        emitter.emit 'foo_bar'
        expect(object.onFooBar).toHaveBeenCalled()

        expect(object.foo).not.toHaveBeenCalled()
        expect(object.bar).not.toHaveBeenCalled()


      it 'should bind methods to the owner object', ->
        object.onFoo.andCallFake ->
          expect(this).toBe object

        object.onFooBar.andCallFake ->
          expect(this).toBe object

        emitter.emit 'foo'
        emitter.emit 'foo_bar'
        expect(object.onFoo).toHaveBeenCalled()
        expect(object.onFooBar).toHaveBeenCalled()
        expect(object.foo).not.toHaveBeenCalled()
        expect(object.bar).not.toHaveBeenCalled()


  #============================================================================
  # events.bindAll
  #============================================================================
  describe 'bindAll', ->

    it 'should take emitter as second argument', ->
      object = jasmine.createSpyObj 'object', ['onFoo']

      e.bindAll object, emitter
      emitter.emit 'foo'
      emitter.emit 'bar'

      expect(object.onFoo).toHaveBeenCalled()
