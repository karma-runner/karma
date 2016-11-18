class Emitter {
  private listeners = {}

  on(event, fn) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(fn)
  }

  emit(event) {
    var eventListeners = this.listeners[event]

    if (!eventListeners) return

    var i = 0
    while (i < eventListeners.length) {
      eventListeners[i].apply(null, Array.prototype.slice.call(arguments, 1))
      i++
    }
  }
}

export class MockSocket extends Emitter {

  socket = {transport: {name: 'websocket'}}

  transportName = 'websocket'

  io = {
    engine: {
      on: (event, cb) => {
        if (event === 'upgrade' && this.transportName === 'websocket') {
          cb()
        }
      }
    }
  }

  disconnect = () => {
    this.emit('disconnect')
  }

  // MOCK API
  _setTransportNameTo = (name) => {
    this.transportName = name
  }
}
