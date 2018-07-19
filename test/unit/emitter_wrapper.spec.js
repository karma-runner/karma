'use strict'

const EventEmitter = require('events').EventEmitter
const EmitterWrapper = require('../../lib/emitter_wrapper')

describe('emitter_wrapper', () => {
  let emitter
  let wrapped

  beforeEach(() => {
    emitter = new EventEmitter()
    emitter.aMethod = (e) => true
    emitter.on('anEvent', emitter.aMethod)
    wrapped = new EmitterWrapper(emitter)
  })

  describe('addListener', () => {
    const aListener = (e) => true

    it('should add a listener to the wrapped emitter', () => {
      wrapped.addListener('anEvent', aListener)
      expect(emitter.listeners('anEvent')).to.contain(aListener)
    })

    it('returns the wrapped emitter', () => {
      expect(wrapped.addListener('anEvent', aListener)).to.equal(wrapped)
    })
  })

  describe('removeAllListeners', () => {
    const aListener = (e) => true

    beforeEach(() => {
      wrapped.addListener('anEvent', aListener)
    })

    it('should remove listeners that were attached via the wrapper', () => {
      wrapped.removeAllListeners()
      expect(emitter.listeners('anEvent')).not.to.contain(aListener)
    })

    it('should not remove listeners that were attached to the original emitter', () => {
      wrapped.removeAllListeners()
      expect(emitter.listeners('anEvent')).to.contain(emitter.aMethod)
    })

    it('should remove only matching listeners when called with an event name', () => {
      const anotherListener = (e) => true
      wrapped.addListener('anotherEvent', anotherListener)
      wrapped.removeAllListeners('anEvent')
      expect(emitter.listeners('anEvent')).not.to.contain(aListener)
      expect(emitter.listeners('anotherEvent')).to.contain(anotherListener)
    })

    it('returns the wrapped emitter', () => {
      expect(wrapped.addListener('anEvent', aListener)).to.equal(wrapped)
    })
  })
})
