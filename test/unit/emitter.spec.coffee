#==============================================================================
# lib/emitter.js module
#==============================================================================
describe 'emitter', ->
  e = require '../../lib/emitter'
  emitter = null

  beforeEach ->
    emitter = new e.EventEmitter

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
      expect(object.onFoo).toHaveBeenCalled

      emitter.emit 'foo_bar'
      expect(object.onFooBar).toHaveBeenCalled

      expect(object.foo).not.toHaveBeenCalled
      expect(object.bar).not.toHaveBeenCalled


    it 'should bind methods to the owner object', ->
      object.onFoo.andCallFake ->
        expect(this).toBe object

      object.onFooBar.andCallFake ->
        expect(this).toBe object

      emitter.emit 'foo'
      emitter.emit 'foo_bar'
      expect(object.onFoo).toHaveBeenCalled
      expect(object.onFooBar).toHaveBeenCalled
      expect(object.foo).not.toHaveBeenCalled
      expect(object.bar).not.toHaveBeenCalled
