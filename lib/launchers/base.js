const KarmaEventEmitter = require('../events').EventEmitter
const EventEmitter = require('events').EventEmitter

const log = require('../logger').create('launcher')
const helper = require('../helper')

const BEING_CAPTURED = 'BEING_CAPTURED'
const CAPTURED = 'CAPTURED'
const BEING_KILLED = 'BEING_KILLED'
const FINISHED = 'FINISHED'
const RESTARTING = 'RESTARTING'
const BEING_FORCE_KILLED = 'BEING_FORCE_KILLED'

/**
 * Base launcher that any custom launcher extends.
 */
function BaseLauncher (id, emitter) {
  if (this.start) {
    return
  }

  // TODO(vojta): figure out how to do inheritance with DI
  Object.keys(EventEmitter.prototype).forEach(function (method) {
    this[method] = EventEmitter.prototype[method]
  }, this)

  this.bind = KarmaEventEmitter.prototype.bind.bind(this)
  this.emitAsync = KarmaEventEmitter.prototype.emitAsync.bind(this)

  this.id = id
  this._state = null
  Object.defineProperty(this, 'state', {
    get: () => {
      return this._state
    },
    set: (toState) => {
      log.debug(`${this._state} -> ${toState}`)
      this._state = toState
    }
  })

  this.error = null

  let killingPromise
  let previousUrl

  this.start = function (url) {
    previousUrl = url

    this.error = null
    this.state = BEING_CAPTURED
    this.emit('start', url + '?id=' + this.id + (helper.isDefined(this.displayName) ? '&displayName=' + encodeURIComponent(this.displayName) : ''))
  }

  this.kill = function () {
    // Already killed, or being killed.
    if (killingPromise) {
      return killingPromise
    }

    killingPromise = this.emitAsync('kill').then(() => {
      this.state = FINISHED
    })

    this.state = BEING_KILLED

    return killingPromise
  }

  this.forceKill = function () {
    this.kill()
    this.state = BEING_FORCE_KILLED

    return killingPromise
  }

  this.restart = function () {
    if (this.state === BEING_FORCE_KILLED) {
      return
    }

    if (!killingPromise) {
      killingPromise = this.emitAsync('kill')
    }

    killingPromise.then(() => {
      if (this.state === BEING_FORCE_KILLED) {
        this.state = FINISHED
      } else {
        killingPromise = null
        log.debug(`Restarting ${this.name}`)
        this.start(previousUrl)
      }
    })

    this.state = RESTARTING
  }

  this.markCaptured = function () {
    if (this.state === BEING_CAPTURED) {
      this.state = CAPTURED
    }
  }

  this.isCaptured = function () {
    return this.state === CAPTURED
  }

  this.toString = function () {
    return this.name
  }

  this._done = function (error) {
    killingPromise = killingPromise || Promise.resolve()

    this.error = this.error || error
    this.emit('done')

    if (this.error && this.state !== BEING_FORCE_KILLED && this.state !== RESTARTING) {
      emitter.emit('browser_process_failure', this)
    }

    this.state = FINISHED
  }

  this.STATE_BEING_CAPTURED = BEING_CAPTURED
  this.STATE_CAPTURED = CAPTURED
  this.STATE_BEING_KILLED = BEING_KILLED
  this.STATE_FINISHED = FINISHED
  this.STATE_RESTARTING = RESTARTING
  this.STATE_BEING_FORCE_KILLED = BEING_FORCE_KILLED
}

BaseLauncher.decoratorFactory = function (id, emitter) {
  return function (launcher) {
    BaseLauncher.call(launcher, id, emitter)
  }
}

module.exports = BaseLauncher
