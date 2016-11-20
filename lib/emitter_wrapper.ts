export class EmitterWrapper {
  private listeners

  constructor(public emitter) {
    this.listeners = {}
  }

  on(event, listener) {
    this.emitter.addListener(event, listener)

    if (!this.listeners.hasOwnProperty(event)) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)

    return this
  }

  addListener = this.on

  removeAllListeners(event?) {
    var events = event ? [event] : Object.keys(this.listeners)
    events.forEach(event => {
      this.listeners[event].forEach(listener =>
        this.emitter.removeListener(event, listener)
      )
      delete this.listeners[event]
    })

    return this
  }
}