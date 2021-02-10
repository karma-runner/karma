'use strict'

const BrowserResult = require('./browser_result')
const helper = require('./helper')
const logger = require('./logger')

const CONNECTED = 'CONNECTED' // The browser is connected but not yet been commanded to execute tests, or finished testing.
const CONFIGURING = 'CONFIGURING' // The browser has been told to execute tests; it is configuring before tests execution.
const EXECUTING = 'EXECUTING' // The browser is executing the tests.
/* The browser got completely disconnected (e.g. browser crash) and can be only restored with a restart of execution. */
const DISCONNECTED = 'DISCONNECTED'

class Browser {
  constructor (id, fullName, collection, emitter, socket, timer, disconnectDelay, pingTimeout, singleRun, clientConfig) {
    this.id = id
    this.fullName = fullName
    this.name = helper.browserFullNameToShort(fullName)
    this.lastResult = new BrowserResult()
    this.disconnectsCount = 0
    this.singleRun = singleRun
    this.clientConfig = clientConfig
    this.collection = collection
    this.emitter = emitter
    this.socket = socket
    this.timer = timer
    this.disconnectDelay = disconnectDelay
    // Set onto the socket when it was created.
    this.pingTimeout = pingTimeout

    this.log = logger.create(this.name)

    this.setState(CONNECTED)
  }

  init () {
    this.log.info(`Binding socket ${this.socket.id} to browser with id ${this.id}`)

    this.bindSocketEvents(this.socket)
    this.collection.add(this)
    this.emitter.emit('browser_register', this)
  }

  setState (toState) {
    this.log.debug(`${this.state} -> ${toState}`)
    this.state = toState
  }

  onKarmaError (error) {
    if (this.isNotConnected()) {
      this.lastResult.error = true
    }
    this.emitter.emit('browser_error', this, error)
  }

  onInfo (info) {
    if (helper.isDefined(info.dump)) {
      this.emitter.emit('browser_log', this, info.dump, 'dump')
    }

    if (helper.isDefined(info.log)) {
      this.emitter.emit('browser_log', this, info.log, info.type)
    } else if (helper.isDefined(info.total)) {
      if (this.state === EXECUTING) {
        this.lastResult.total = info.total
      }
    } else if (!helper.isDefined(info.dump)) {
      this.emitter.emit('browser_info', this, info)
    }
  }

  onStart (info) {
    if (info.total === null) {
      this.log.warn('Adapter did not report total number of specs.')
    }

    this.lastResult = new BrowserResult(info.total)
    this.setState(EXECUTING)
    this.emitter.emit('browser_start', this, info)
  }

  onComplete (result) {
    if (this.state !== EXECUTING) {
      this.log.warn(`Unexpected:'complete' event arrived while in state ${this.state}`)
    }
    this.lastResult.totalTimeEnd()
    this.setState(CONNECTED)
    this.socket.disconnect(true)
  }

  onSocketDisconnect (reason, disconnectedSocket) {
    if (this.state === DISCONNECTED) {
      return
    }
    // Done with this socket
    disconnectedSocket.disconnect()
    disconnectedSocket.removeAllListeners()

    if (this.state !== CONNECTED) {
      // If we loaded the context or began testing, `disconnect` loses data.
      this.emitter.emit('browser_error', this, `Disconnected from state ${this.state} with reason: ${reason || ''}`)
      if (reason === 'ping timeout') {
        this.log.info('Check for a test that crashes the browser or tab.')
        this.log.info(`For large JS or tests that take longer than ${this.pingTimeout}ms, increase 'config.pingTimeout'`)
      } else if (reason === 'transport close') {
        this.log.info('The client may have disconnected.')
      }
      this.lastResult.totalTimeEnd()
      this.lastResult.disconnected = true

      this.timer.setTimeout(() => {
        // If we disconnect during a test the server can retry the browser
        this.disconnectsCount++
        this.finishDisconnect()
      }, this.disconnectDelay)
    } else {
      this.finishDisconnect()
    }
  }

  onResult (result) {
    if (Array.isArray(result)) {
      result.forEach(this.onResult, this)
    } else if (this.isNotConnected()) {
      this.lastResult.add(result)
      this.emitter.emit('spec_complete', this, result)
    }
  }

  execute () {
    this.socket.emit('execute', this.clientConfig)
    this.setState(CONFIGURING)
  }

  finishDisconnect () {
    this.emitter.emit('browser_complete', this)
    this.remove()
  }

  remove () {
    this.setState(DISCONNECTED)
    this.collection.remove(this)
  }

  bindSocketEvents (socket) {
    // TODO: check which of these events are actually emitted by socket
    socket.on('disconnect', (reason) => this.onSocketDisconnect(reason, socket))
    socket.on('start', (info) => this.onStart(info))
    socket.on('karma_error', (error) => this.onKarmaError(error))
    socket.on('complete', (result) => this.onComplete(result))
    socket.on('info', (info) => this.onInfo(info))
    socket.on('result', (result) => this.onResult(result))
  }

  isConnected () {
    return this.state === CONNECTED
  }

  isNotConnected () {
    return !this.isConnected()
  }

  serialize () {
    return {
      id: this.id,
      name: this.name,
      isConnected: this.state === CONNECTED
    }
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
      disconnectDelay: this.disconnectDelay
    }
  }
}

Browser.factory = function (
  id, fullName, /* capturedBrowsers */ collection, emitter, socket, timer,
  /* config.browserDisconnectTimeout */ disconnectDelay,
  /* config.pingTimeout */ pingTimeout,
  /* config.singleRun */ singleRun,
  /* config.client */ clientConfig) {
  return new Browser(id, fullName, collection, emitter, socket, timer,
    disconnectDelay, pingTimeout, singleRun, clientConfig)
}

Browser.STATE_CONNECTED = CONNECTED
Browser.STATE_CONFIGURING = CONFIGURING
Browser.STATE_EXECUTING = EXECUTING
Browser.STATE_DISCONNECTED = DISCONNECTED

module.exports = Browser
