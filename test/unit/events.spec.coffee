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
      spy = sinon.spy()

      emitter.on 'abc', spy
      emitter.emit 'abc'
      expect(spy).to.have.been.called


    #==========================================================================
    # events.EventEmitter.bind()
    #==========================================================================
    describe 'bind', ->
      object = null

      beforeEach ->
        object = sinon.stub
          onFoo: ->
          onFooBar: ->
          foo: ->
          bar: ->
        emitter.bind object


      it 'should register all "on" methods to events', ->
        emitter.emit 'foo'
        expect(object.onFoo).to.have.been.called

        emitter.emit 'foo_bar'
        expect(object.onFooBar).to.have.been.called

        expect(object.foo).not.to.have.been.called
        expect(object.bar).not.to.have.been.called        

      it 'should bind methods to the owner object', ->
        emitter.emit 'foo'
        emitter.emit 'foo_bar'
        
        expect(object.onFoo).to.have.always.been.calledOn object
        expect(object.onFooBar).to.have.always.been.calledOn object
        expect(object.foo).not.to.have.been.called
        expect(object.bar).not.to.have.been.called
        

    #==========================================================================
    # events.EventEmitter.emitAsync()
    #==========================================================================
    describe 'emitAsync', ->
      object = null

      beforeEach ->
        object = sinon.stub
          onFoo: ->
          onFooBar: ->
          foo: ->
          bar: ->
        emitter.bind object


      it 'should resolve the promise once all listeners are done', (done) ->
        callbacks = []
        eventDone = sinon.spy()
  
        emitter.on 'a', (d) -> d()
        emitter.on 'a', (d) -> callbacks.push d
        emitter.on 'a', (d) -> callbacks.push d

        promise = emitter.emitAsync('a')
        
        expect(eventDone).not.to.have.been.called
        callbacks.pop()()
        expect(eventDone).not.to.have.been.called
        callbacks.pop()()
        
        promise.then ->
          eventDone()
          expect(eventDone).to.have.been.called
          done()
        

  #============================================================================
  # events.bindAll
  #============================================================================
  describe 'bindAll', ->

    it 'should take emitter as second argument', ->
      object = sinon.stub onFoo: ->

      e.bindAll object, emitter
      emitter.emit 'foo'
      emitter.emit 'bar'

      expect(object.onFoo).to.have.been.called
