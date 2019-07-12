const e = require('../../lib/events')

describe('events', () => {
  let emitter

  beforeEach(() => {
    emitter = new e.EventEmitter()
  })

  describe('EventEmitter', () => {
    it('should emit events', () => {
      const spy = sinon.spy()

      emitter.on('abc', spy)
      emitter.emit('abc')
      expect(spy).to.have.been.called
    })

    describe('bind', () => {
      let object = null

      beforeEach(() => {
        // Note: es6 class instances have non-enumerable prototype properties.
        function FB () {};
        FB.prototype = {
          onPrototypeBar () {}
        }
        object = new FB()
        Object.assign(object, {
          onFoo: () => {},
          onFooBar: () => {},
          foo: () => {}
        })

        emitter.bind(object)
      })

      it('should register all "on" methods to events', () => {
        sinon.spy(object, 'onFoo')
        emitter.emit('foo')
        expect(object.onFoo).to.have.been.called

        sinon.spy(object, 'onFooBar')
        emitter.emit('foo_bar')
        expect(object.onFooBar).to.have.been.called

        sinon.spy(object, 'onPrototypeBar')
        emitter.emit('prototype_bar')
        expect(object.onPrototypeBar).to.have.been.called

        sinon.spy(object, 'foo')
        expect(object.foo).not.to.have.been.called
      })

      it('should bind methods to the owner object', () => {
        sinon.spy(object, 'foo')
        sinon.spy(object, 'onFoo')
        sinon.spy(object, 'onFooBar')
        emitter.emit('foo')
        emitter.emit('foo_bar')

        expect(object.onFoo).to.have.always.been.calledOn(object)
        expect(object.onFooBar).to.have.always.been.calledOn(object)
        expect(object.foo).not.to.have.been.called
      })
    })

    describe('emitAsync', () => {
      let object = null

      beforeEach(() => {
        object = sinon.stub({
          onFoo: () => {},
          onFooBar: () => {},
          foo: () => {},
          bar: () => {}
        })
        emitter.bind(object)
      })

      it('should resolve the promise once all listeners are done', (done) => {
        const callbacks = []
        const eventDone = sinon.spy()

        emitter.on('a', (d) => d())
        emitter.on('a', (d) => callbacks.push(d))
        emitter.on('a', (d) => callbacks.push(d))

        const promise = emitter.emitAsync('a')

        expect(eventDone).not.to.have.been.called
        callbacks.pop()()
        expect(eventDone).not.to.have.been.called
        callbacks.pop()()

        promise.then(() => {
          eventDone()
          expect(eventDone).to.have.been.called
          done()
        })
      })

      it('should resolve asynchronously when no listener', (done) => {
        const spyDone = sinon.spy(done)
        emitter.emitAsync('whatever').then(spyDone)
        expect(spyDone).to.not.have.been.called
      })
    })
  })

  describe('bindAll', () => {
    it('should take emitter as second argument', () => {
      const object = sinon.stub({ onFoo: () => {} })

      emitter.bind(object)
      emitter.emit('foo')
      emitter.emit('bar')

      expect(object.onFoo).to.have.been.called
    })

    it('should append "context" to event arguments', () => {
      const object = sinon.stub({ onFoo: () => {} })

      emitter.bind(object)
      emitter.emit('foo', 'event-argument')

      expect(object.onFoo).to.have.been.calledWith('event-argument', emitter)
    })
  })

  describe('bufferEvents', () => {
    it('should reply all events', () => {
      const spy = sinon.spy()
      const replyEvents = e.bufferEvents(emitter, ['foo', 'bar'])

      emitter.emit('foo', 'foo-1')
      emitter.emit('bar', 'bar-2')
      emitter.emit('foo', 'foo-3')

      emitter.on('foo', spy)
      emitter.on('bar', spy)

      replyEvents()
      expect(spy).to.have.been.calledThrice
      expect(spy.firstCall).to.have.been.calledWith('foo-1')
      expect(spy.secondCall).to.have.been.calledWith('bar-2')
      expect(spy.thirdCall).to.have.been.calledWith('foo-3')
    })

    it('should not buffer after reply()', () => {
      const spy = sinon.spy()
      const replyEvents = e.bufferEvents(emitter, ['foo', 'bar'])
      replyEvents()

      emitter.emit('foo', 'foo-1')
      emitter.emit('bar', 'bar-2')
      emitter.emit('foo', 'foo-3')

      emitter.on('foo', spy)
      emitter.on('bar', spy)

      replyEvents()
      expect(spy).to.not.have.been.called
    })

    it('should work with overriden "emit" method', () => {
      // This is to make sure it works with socket.io sockets,
      // which overrides the emit() method to send the event through the wire,
      // instead of local emit.
      const originalEmit = emitter.emit
      emitter.emit = () => null

      const spy = sinon.spy()
      const replyEvents = e.bufferEvents(emitter, ['foo'])

      originalEmit.apply(emitter, ['foo', 'whatever'])

      emitter.on('foo', spy)

      replyEvents()
      expect(spy).to.have.been.calledWith('whatever')
    })
  })
})
