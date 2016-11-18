import helper = require('./helper')
import events = require('./events')
import logger = require('./logger')

import {Result} from './browser_result'

// The browser is ready to execute tests.
var READY = 1

// The browser is executing the tests.
var EXECUTING = 2

// The browser is not executing, but temporarily disconnected (waiting for reconnecting).
var READY_DISCONNECTED = 3

// The browser is executing the tests, but temporarily disconnect (waiting for reconnecting).
var EXECUTING_DISCONNECTED = 4

// The browser got permanently disconnected (being removed from the collection and destroyed).
var DISCONNECTED = 5

export class Browser {
  name = helper.browserFullNameToShort(this.fullName)
  private log = logger.create(this.name)
  state
  lastResult
  disconnectsCount

  constructor(public id?,
              public fullName?,
              /* capturedBrowsers */ private collection?,
              private emitter?,
              private socket?,
              private timer?,
              /* config.browserDisconnectTimeout */ private disconnectDelay?,
              /* config.browserNoActivityTimeout */ private noActivityTimeout?) {
    this.state = READY
    this.lastResult = new Result()
    this.disconnectsCount = 0
  }

  private activeSockets = [this.socket]
  private activeSocketsIds() {
    return this.activeSockets.map(function (s) {
      return s.id
    }).join(', ')
  }

  private pendingDisconnect
  private disconnect(reason?) {
    this.state = DISCONNECTED
    this.disconnectsCount++
    this.log.warn('Disconnected (%d times)' + (reason || ''), this.disconnectsCount)
    this.emitter.emit('browser_error', this, 'Disconnected' + reason)
    this.collection.remove(this)
  }

  private noActivityTimeoutId
  private refreshNoActivityTimeout = this.noActivityTimeout ? () => {
    this.clearNoActivityTimeout()
    this.noActivityTimeoutId = this.timer.setTimeout(() => {
      this.lastResult.totalTimeEnd()
      this.lastResult.disconnected = true
      this.disconnect(', because no message in ' + this.noActivityTimeout + ' ms.')
      this.emitter.emit('browser_complete', this)
    }, this.noActivityTimeout)
  } : () => {
  }

  private clearNoActivityTimeout = this.noActivityTimeout ? () => {
    if (this.noActivityTimeoutId) {
      this.timer.clearTimeout(this.noActivityTimeoutId)
      this.noActivityTimeoutId = null
    }
  } : () => {
  }

  init() {
    this.collection.add(this)

    events.bindAll(this, this.socket)

    this.log.info('Connected on socket %s with id %s', this.socket.id, this.id)

    // TODO(vojta): move to collection
    this.emitter.emit('browsers_change', this.collection)

    this.emitter.emit('browser_register', this)
  }

  isReady() {
    return this.state === READY
  }

  toString() {
    return this.name
  }

  onKarmaError(error) {
    if (this.isReady()) {
      return
    }

    this.lastResult.error = true
    this.emitter.emit('browser_error', this, error)

    this.refreshNoActivityTimeout()
  }

  onInfo(info) {
    if (this.isReady()) {
      return
    }

    // TODO(vojta): remove
    if (helper.isDefined(info.dump)) {
      this.emitter.emit('browser_log', this, info.dump, 'dump')
    }

    if (helper.isDefined(info.log)) {
      this.emitter.emit('browser_log', this, info.log, info.type)
    }

    this.refreshNoActivityTimeout()
  }

  onStart(info) {
    this.lastResult = new Result()
    this.lastResult.total = info.total

    if (info.total === null) {
      this.log.warn('Adapter did not report total number of specs.')
    }

    this.emitter.emit('browser_start', this, info)
    this.refreshNoActivityTimeout()
  }

  onComplete(result) {
    if (this.isReady()) {
      return
    }

    this.state = READY
    this.lastResult.totalTimeEnd()

    if (!this.lastResult.success) {
      this.lastResult.error = true
    }

    this.emitter.emit('browsers_change', this.collection)
    this.emitter.emit('browser_complete', this, result)

    this.clearNoActivityTimeout()
  }

  onDisconnect(_, disconnectedSocket) {
    this.activeSockets.splice(this.activeSockets.indexOf(disconnectedSocket), 1)

    if (this.activeSockets.length) {
      this.log.debug('Disconnected %s, still have %s', disconnectedSocket.id, this.activeSocketsIds())
      return
    }

    if (this.state === READY) {
      this.disconnect()
    } else if (this.state === EXECUTING) {
      this.log.debug('Disconnected during run, waiting %sms for reconnecting.', this.disconnectDelay)
      this.state = EXECUTING_DISCONNECTED

      this.pendingDisconnect = this.timer.setTimeout(() => {
        this.lastResult.totalTimeEnd()
        this.lastResult.disconnected = true
        this.disconnect()
        this.emitter.emit('browser_complete', this)
      }, this.disconnectDelay)

      this.clearNoActivityTimeout()
    }
  }

  reconnect(newSocket) {
    if (this.state === EXECUTING_DISCONNECTED) {
      this.state = EXECUTING
      this.log.debug('Reconnected on %s.', newSocket.id)
    } else if (this.state === EXECUTING || this.state === READY) {
      this.log.debug('New connection %s (already have %s)', newSocket.id, this.activeSocketsIds())
    } else if (this.state === DISCONNECTED) {
      this.state = READY
      this.log.info('Connected on socket %s with id %s', newSocket.id, this.id)
      this.collection.add(this)

      // TODO(vojta): move to collection
      this.emitter.emit('browsers_change', this.collection)

      this.emitter.emit('browser_register', this)
    }

    var exists = this.activeSockets.some(s => s.id === newSocket.id)
    if (!exists) {
      this.activeSockets.push(newSocket)
      events.bindAll(this, newSocket)
    }

    if (this.pendingDisconnect) {
      this.timer.clearTimeout(this.pendingDisconnect)
    }

    this.refreshNoActivityTimeout()
  }

  onResult(result) {
    if (result.length) {
      return result.forEach(this.onResult, this)
    }

    // ignore - probably results from last run (after server disconnecting)
    if (this.isReady()) {
      return
    }

    this.lastResult.add(result)

    this.emitter.emit('spec_complete', this, result)
    this.refreshNoActivityTimeout()
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      isReady: this.state === READY
    }
  }

  execute(config) {
    this.activeSockets.forEach(function (socket) {
      socket.emit('execute', config)
    })

    this.state = EXECUTING
    this.refreshNoActivityTimeout()
  }

  static STATE_READY = READY
  static STATE_EXECUTING = EXECUTING
  static STATE_READY_DISCONNECTED = READY_DISCONNECTED
  static STATE_EXECUTING_DISCONNECTED = EXECUTING_DISCONNECTED
  static STATE_DISCONNECTED = DISCONNECTED
}