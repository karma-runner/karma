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


      it 'should resolve asynchronously when no listener', (done) ->
        spyDone = sinon.spy done
        emitter.emitAsync('whatever').then spyDone
        expect(spyDone).to.not.have.been.called


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


    it 'should append "context" to event arguments', ->
      object = sinon.stub onFoo: ->

      e.bindAll object, emitter
      emitter.emit 'foo', 'event-argument'

      expect(object.onFoo).to.have.been.calledWith 'event-argument', emitter


  #============================================================================
  # events.bufferEvents
  #============================================================================
  describe 'bufferEvents', ->

    it 'should reply all events', ->
      spy = sinon.spy()
      replyEvents = e.bufferEvents emitter, ['foo', 'bar']

      emitter.emit 'foo', 'foo-1'
      emitter.emit 'bar', 'bar-2'
      emitter.emit 'foo', 'foo-3'

      emitter.on 'foo', spy
      emitter.on 'bar', spy

      replyEvents()
      expect(spy).to.have.been.calledThrice
      expect(spy.firstCall).to.have.been.calledWith 'foo-1'
      expect(spy.secondCall).to.have.been.calledWith 'bar-2'
      expect(spy.thirdCall).to.have.been.calledWith 'foo-3'


    it 'should not buffer after reply()', ->
      spy = sinon.spy()
      replyEvents = e.bufferEvents emitter, ['foo', 'bar']
      replyEvents()

      emitter.emit 'foo', 'foo-1'
      emitter.emit 'bar', 'bar-2'
      emitter.emit 'foo', 'foo-3'

      emitter.on 'foo', spy
      emitter.on 'bar', spy

      replyEvents()
      expect(spy).to.not.have.been.caleed


    it 'should work with overriden "emit" method', ->
      # This is to make sure it works with socket.io sockets,
      # which overrides the emit() method to send the event through the wire,
      # instead of local emit.
      originalEmit = emitter.emit
      emitter.emit = -> null

      spy = sinon.spy()
      replyEvents = e.bufferEvents emitter, ['foo']

      originalEmit.apply emitter, ['foo', 'whatever']

      emitter.on 'foo', spy

      replyEvents()
      expect(spy).to.have.been.calledWith 'whatever'
