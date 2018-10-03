function Emitter () {
  const listeners = {}

  this.on = function (event, fn) {
    if (!listeners[event]) {
      listeners[event] = []
    }

    listeners[event].push(fn)
  }

  this.emit = function (event) {
    const eventListeners = listeners[event]

    if (!eventListeners) return

    let i = 0
    while (i < eventListeners.length) {
      eventListeners[i].apply(null, Array.prototype.slice.call(arguments, 1))
      i++
    }
  }
}

function MockSocket () {
  Emitter.call(this)

  this.socket = {transport: {name: 'websocket'}}

  let transportName = 'websocket'

  this.io = {
    engine: {
      on: function (event, cb) {
        if (event === 'upgrade' && transportName === 'websocket') {
          cb()
        }
      }
    }
  }

  this.disconnect = function () {
    this.emit('disconnect')
  }

  // MOCK API
  this._setTransportNameTo = function (name) {
    transportName = name
  }
}

exports.Socket = MockSocket
