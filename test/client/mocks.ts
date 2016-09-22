var Emitter = function () {
  var listeners = {}

  this.on = function (event, fn) {
    if (!listeners[event]) {
      listeners[event] = []
    }

    listeners[event].push(fn)
  }

  this.emit = function (event) {
    var eventListeners = listeners[event]

    if (!eventListeners) return

    var i = 0
    while (i < eventListeners.length) {
      eventListeners[i].apply(null, Array.prototype.slice.call(arguments, 1))
      i++
    }
  }
}

var MockSocket = function () {
  Emitter.call(this)

  this.socket = {transport: {name: 'websocket'}}

  var transportName = 'websocket'

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
