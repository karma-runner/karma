'use strict'

const Result = require('./browser_result')
const helper = require('./helper')
const logger = require('./logger')

// The browser is connected but not yet been commanded to execute tests.
const CONNECTED = 1

// The browser has been told to execute tests; it is configuring before tests execution.
const CONFIGURING = 2

// The browser is executing the tests.
const EXECUTING = 3

// The browser is executing the tests, but temporarily disconnect (waiting for reconnecting).
const EXECUTING_DISCONNECTED = 4

// The browser got permanently disconnected (being removed from the collection and destroyed).
const DISCONNECTED = 5

class Browser {
  constructor (id, fullName, collection, emitter, socket, timer, disconnectDelay, noActivityTimeout) {
    this.id = id
    this.fullName = fullName
    this.name = helper.browserFullNameToShort(fullName)
    this.state = CONNECTED
    this.lastResult = new Result()
    this.disconnectsCount = 0
    this.activeSockets = [socket]
    this.noActivityTimeout = noActivityTimeout
    this.collection = collection
    this.emitter = emitter
    this.socket = socket
    this.timer = timer
    this.disconnectDelay = disconnectDelay

    this.log = logger.create(this.name)

    this.noActivityTimeoutId = null
    this.pendingDisconnect = null
  }

  init () {
    this.collection.add(this)

    this.bindSocketEvents(this.socket)

    this.log.info('Connected on socket %s with id %s', this.socket.id, this.id)

    // TODO(vojta): move to collection
    this.emitter.emit('browsers_change', this.collection)

    this.emitter.emit('browser_register', this)
  }

  isConnected () {
    return this.state === CONNECTED
  }

  toString () {
    return this.name
  }

  toJSON () {
    return {
      id: this.id,
      fullName: this.fullName,
      name: this.name,
      state: this.state,
      lastResult: this.lastResult,
      disconnectsCount: this.disconnectsCount,
      noActivityTimeout: this.noActivityTimeout,
      disconnectDelay: this.disconnectDelay
    }
  }

  onKarmaError (error) {
    if (this.isConnected()) {
      return
    }

    this.lastResult.error = true
    this.emitter.emit('browser_error', this, error)

    this.refreshNoActivityTimeout()
  }

  onInfo (info) {
    if (this.isConnected()) {
      return
    }

    // TODO(vojta): remove
    if (helper.isDefined(info.dump)) {
      this.emitter.emit('browser_log', this, info.dump, 'dump')
    }

    if (helper.isDefined(info.log)) {
      this.emitter.emit('browser_log', this, info.log, info.type)
    }

    if (
      !helper.isDefined(info.log) &&
      !helper.isDefined(info.dump)
    ) {
      this.emitter.emit('browser_info', this, info)
    }

    this.refreshNoActivityTimeout()
  }

  onStart (info) {
    this.lastResult = new Result()
    this.lastResult.total = info.total

    this.state = EXECUTING

    if (info.total === null) {
      this.log.warn('Adapter did not report total number of specs.')
    }

    this.emitter.emit('browser_start', this, info)
    this.refreshNoActivityTimeout()
  }

  onComplete (result) {
    if (this.isConnected()) {
      return
    }

    this.state = CONNECTED
    this.lastResult.totalTimeEnd()

    if (!this.lastResult.success) {
      this.lastResult.error = true
    }

    this.emitter.emit('browsers_change', this.collection)
    this.emitter.emit('browser_complete', this, result)

    this.clearNoActivityTimeout()
  }

  onDisconnect (disconnectedSocket) {
    this.activeSockets.splice(this.activeSockets.indexOf(disconnectedSocket), 1)

    if (this.activeSockets.length) {
      this.log.debug('Disconnected %s, still have %s', disconnectedSocket.id, this.getActiveSocketsIds())
      return
    }

    if (this.state === CONNECTED) {
      this.disconnect()
    } else if (this.state === CONFIGURING || this.state === EXECUTING) {
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

  reconnect (newSocket) {
    if (this.state === EXECUTING_DISCONNECTED) {
      this.state = EXECUTING
      this.log.debug('Reconnected on %s.', newSocket.id)
    } else if (this.state === CONNECTED || this.state === CONFIGURING || this.state === EXECUTING) {
      this.log.debug('New connection %s (already have %s)', newSocket.id, this.getActiveSocketsIds())
    } else if (this.state === DISCONNECTED) {
      this.state = CONNECTED
      this.log.info('Connected on socket %s with id %s', newSocket.id, this.id)
      this.collection.add(this)

      // TODO(vojta): move to collection
      this.emitter.emit('browsers_change', this.collection)

      this.emitter.emit('browser_register', this)
    }

    const exists = this.activeSockets.some((s) => s.id === newSocket.id)
    if (!exists) {
      this.activeSockets.push(newSocket)
      this.bindSocketEvents(newSocket)
    }

    if (this.pendingDisconnect) {
      this.timer.clearTimeout(this.pendingDisconnect)
    }

    this.refreshNoActivityTimeout()
  }

  onResult (result) {
    if (result.length) {
      return result.forEach(this.onResult, this)
    }

    // ignore - probably results from last run (after server disconnecting)
    if (this.isConnected()) {
      return
    }

    this.lastResult.add(result)

    this.emitter.emit('spec_complete', this, result)
    this.refreshNoActivityTimeout()
  }

  serialize () {
    return {
      id: this.id,
      name: this.name,
      isConnected: this.state === CONNECTED
    }
  }

  execute (config) {
    this.activeSockets.forEach((socket) => socket.emit('execute', config))

    this.state = CONFIGURING

    this.refreshNoActivityTimeout()
  }

  getActiveSocketsIds () {
    return this.activeSockets.map((s) => s.id).join(', ')
  }

  disconnect (reason) {
    this.state = DISCONNECTED
    this.disconnectsCount++
    this.log.warn('Disconnected (%d times)' + (reason || ''), this.disconnectsCount)
    this.emitter.emit('browser_error', this, 'Disconnected' + (reason || ''))
    this.collection.remove(this)
  }

  refreshNoActivityTimeout () {
    if (this.noActivityTimeout) {
      this.clearNoActivityTimeout()

      this.noActivityTimeoutId = this.timer.setTimeout(() => {
        this.lastResult.totalTimeEnd()
        this.lastResult.disconnected = true
        this.disconnect(', because no message in ' + this.noActivityTimeout + ' ms.')
        this.emitter.emit('browser_complete', this)
      }, this.noActivityTimeout)
    }
  }

  clearNoActivityTimeout () {
    if (this.noActivityTimeout) {
      if (this.noActivityTimeoutId) {
        this.timer.clearTimeout(this.noActivityTimeoutId)
        this.noActivityTimeoutId = null
      }
    }
  }

  bindSocketEvents (socket) {
    // TODO: check which of these events are actually emitted by socket
    socket.on('disconnect', () => this.onDisconnect(socket))
    socket.on('start', (info) => this.onStart(info))
    socket.on('karma_error', (error) => this.onKarmaError(error))
    socket.on('complete', (result) => this.onComplete(result))
    socket.on('info', (info) => this.onInfo(info))
    socket.on('result', (result) => this.onResult(result))
  }
}

Browser.factory = function (
  id, fullName, /* capturedBrowsers */ collection, emitter, socket, timer,
  /* config.browserDisconnectTimeout */ disconnectDelay,
  /* config.browserNoActivityTimeout */ noActivityTimeout
) {
  return new Browser(id, fullName, collection, emitter, socket, timer, disconnectDelay, noActivityTimeout)
}

Browser.STATE_CONNECTED = CONNECTED
Browser.STATE_CONFIGURING = CONFIGURING
Browser.STATE_EXECUTING = EXECUTING
Browser.STATE_EXECUTING_DISCONNECTED = EXECUTING_DISCONNECTED
Browser.STATE_DISCONNECTED = DISCONNECTED

module.exports = Browser
