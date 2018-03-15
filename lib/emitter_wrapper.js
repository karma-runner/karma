'use strict'

class EmitterWrapper {
  constructor (emitter) {
    this.listeners = {}
    this.emitter = emitter
  }

  addListener (event, listener) {
    this.emitter.addListener(event, listener)

    if (!this.listeners.hasOwnProperty(event)) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)

    return this
  }

  on (event, listener) {
    return this.addListener(event, listener)
  }

  removeAllListeners (event) {
    const events = event ? [event] : Object.keys(this.listeners)
    events.forEach((event) => {
      this.listeners[event].forEach((listener) => {
        this.emitter.removeListener(event, listener)
      })
      delete this.listeners[event]
    })

    return this
  }
}

module.exports = EmitterWrapper
