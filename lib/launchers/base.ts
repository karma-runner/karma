import {KarmaEventEmitter as KarmaEventEmitter} from '../events'
import {EventEmitter} from 'events'
import Promise = require('bluebird')

var log = require('../logger').create('launcher')
import helper = require('../helper')

var BEING_CAPTURED = 1
var CAPTURED = 2
var BEING_KILLED = 3
var FINISHED = 4
var RESTARTING = 5
var BEING_FORCE_KILLED = 6

/**
 * Base launcher that any custom launcher extends.
 */
export class BaseLauncher extends KarmaEventEmitter {

  state = null
  error = null
  start
  private killingPromise
  private previousUrl
  displayName
  name

  constructor(public id, private emitter?) {
    super()

    if (this.start) {
      return
    }

    // TODO(vojta): figure out how to do inheritance with DI
    Object.keys(EventEmitter.prototype).forEach(function (method) {
      this[method] = EventEmitter.prototype[method]
    }, this)

    this.start = (url) => {
      this.previousUrl = url

      this.error = null
      this.state = BEING_CAPTURED
      this.emit('start', url + '?id=' + this.id + (helper.isDefined(this.displayName) ? '&displayName=' + encodeURIComponent(this.displayName) : ''))
    }
  }

  kill = () =>{
    // Already killed, or being killed.
    if (this.killingPromise) {
      return this.killingPromise
    }

    this.killingPromise = this.emitAsync('kill').then(() => {
      this.state = FINISHED
    })

    this.state = BEING_KILLED

    return this.killingPromise
  }

  forceKill = () => {
    this.kill()
    this.state = BEING_FORCE_KILLED

    return this.killingPromise
  }

  restart = () => {
    if (this.state === BEING_FORCE_KILLED) {
      return
    }

    if (!this.killingPromise) {
      this.killingPromise = this.emitAsync('kill')
    }

    this.killingPromise.then(() => {
      if (this.state === BEING_FORCE_KILLED) {
        this.state = FINISHED
      } else {
        this.killingPromise = null
        log.debug('Restarting %s', this.name)
        this.start(this.previousUrl)
      }
    })

    this.state = RESTARTING
  }

  markCaptured = () => {
    if (this.state === BEING_CAPTURED) {
      this.state = CAPTURED
    }
  }

  isCaptured = () => {
    return this.state === CAPTURED
  }

  toString() {
    return this.name
  }

  _done = (error) => {
    this.killingPromise = this.killingPromise || Promise.resolve()

    this.error = this.error || error
    this.emit('done')

    if (this.error && this.state !== BEING_FORCE_KILLED && this.state !== RESTARTING) {
      this.emitter.emit('browser_process_failure', this)
    }

    this.state = FINISHED
  }

  STATE_BEING_CAPTURED = BEING_CAPTURED
  STATE_CAPTURED = CAPTURED
  STATE_BEING_KILLED = BEING_KILLED
  STATE_FINISHED = FINISHED
  STATE_RESTARTING = RESTARTING
  STATE_BEING_FORCE_KILLED = BEING_FORCE_KILLED

  static decoratorFactory(id, emitter) {
    return function (launcher) {
      BaseLauncher.call(launcher, id, emitter)
    }
  }
}