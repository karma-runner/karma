'use strict'

const EventEmitter = require('events').EventEmitter
const helper = require('./helper')

function bufferEvents (emitter, eventsToBuffer) {
  const listeners = []
  const eventsToReply = []

  function genericListener () {
    eventsToReply.push(Array.from(arguments))
  }

  eventsToBuffer.forEach((eventName) => {
    const listener = genericListener.bind(null, eventName)
    listeners.push(listener)
    emitter.on(eventName, listener)
  })

  return function () {
    listeners.forEach((listener, i) => {
      emitter.removeListener(eventsToBuffer[i], listener)
    })

    eventsToReply.forEach((args) => {
      EventEmitter.prototype.emit.apply(emitter, args)
    })

    listeners.length = 0
    eventsToReply.length = 0
  }
}

class KarmaEventEmitter extends EventEmitter {
  bind (object) {
    for (const method in object) {
      if (method.startsWith('on') && helper.isFunction(object[method])) {
        this.on(helper.camelToSnake(method.slice(2)), function () {
          // We do not use an arrow function here, to supply the caller as this.
          object[method].apply(object, Array.from(arguments).concat(this))
        })
      }
    }
  }

  emitAsync (name) {
    // TODO(vojta): allow passing args
    // TODO(vojta): ignore/throw if listener call done() multiple times
    let pending = this.listeners(name).length
    const deferred = helper.defer()

    this.emit(name, () => {
      if (!--pending) {
        deferred.resolve()
      }
    })

    if (!pending) {
      deferred.resolve()
    }

    return deferred.promise
  }
}

exports.EventEmitter = KarmaEventEmitter
exports.bufferEvents = bufferEvents
