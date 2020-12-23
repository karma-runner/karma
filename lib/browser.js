'use strict'

const BrowserResult = require('./browser_result')
const helper = require('./helper')
const logger = require('./logger')

const CONNECTED = 'CONNECTED' // The browser is connected but not yet been commanded to execute tests.
const CONFIGURING = 'CONFIGURING' // The browser has been told to execute tests; it is configuring before tests execution.
const EXECUTING = 'EXECUTING' // The browser is executing the tests.
const EXECUTING_DISCONNECTED = 'EXECUTING_DISCONNECTED' // The browser is executing the tests, but temporarily disconnect (waiting for socket reconnecting).
const DISCONNECTED = 'DISCONNECTED' // The browser got completely disconnected (e.g. browser crash) and can be only restored with a restart of execution.

class Browser {
  constructor (id, fullName, collection, emitter, socket, timer, disconnectDelay,
    noActivityTimeout, singleRun, clientConfig) {
    this.id = id
    this.fullName = fullName
    this.name = helper.browserFullNameToShort(fullName)
    this.lastResult = new BrowserResult()
    this.disconnectsCount = 0
    this.activeSockets = [socket]
    this.noActivityTimeout = noActivityTimeout
    this.singleRun = singleRun
    this.clientConfig = clientConfig
    this.collection = collection
    this.emitter = emitter
    this.socket = socket
    this.timer = timer
    this.disconnectDelay = disconnectDelay

    this.log = logger.create(this.name)

    this.noActivityTimeoutId = null
    this.pendingDisconnect = null
    this.setState(CONNECTED)
  }

  init () {
    this.log.info(`Connected on socket ${this.socket.id} with id ${this.id}`)

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
    this.refreshNoActivityTimeout()
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

    this.refreshNoActivityTimeout()
  }

  onStart (info) {
    if (info.total === null) {
      this.log.warn('Adapter did not report total number of specs.')
    }

    this.lastResult = new BrowserResult(info.total)
    this.setState(EXECUTING)
    this.emitter.emit('browser_start', this, info)
    this.refreshNoActivityTimeout()
  }

  onComplete (result) {
    if (this.isNotConnected()) {
      this.setState(CONNECTED)
      this.lastResult.totalTimeEnd()

      this.emitter.emit('browsers_change', this.collection)
      this.emitter.emit('browser_complete', this, result)

      this.clearNoActivityTimeout()
    }
  }

  onSocketDisconnect (reason, disconnectedSocket) {
    helper.arrayRemove(this.activeSockets, disconnectedSocket)
    if (this.activeSockets.length) {
      this.log.debug(`Disconnected ${disconnectedSocket.id}, still have ${this.getActiveSocketsIds()}`)
      return
    }

    if (this.isConnected()) {
      this.disconnect(`Client disconnected from CONNECTED state (${reason})`)
    } else if ([CONFIGURING, EXECUTING].includes(this.state)) {
      this.log.debug(`Disconnected during run, waiting ${this.disconnectDelay}ms for reconnecting.`)
      this.setState(EXECUTING_DISCONNECTED)

      this.pendingDisconnect = this.timer.setTimeout(() => {
        this.lastResult.totalTimeEnd()
        this.lastResult.disconnected = true
        this.disconnect(`reconnect failed before timeout of ${this.disconnectDelay}ms (${reason})`)
        this.emitter.emit('browser_complete', this)
      }, this.disconnectDelay)

      this.clearNoActivityTimeout()
    }
  }

  reconnect (newSocket, clientSaysReconnect) {
    if (!clientSaysReconnect || this.state === DISCONNECTED) {
      this.log.info(`Disconnected browser returned on socket ${newSocket.id} with id ${this.id}.`)
      this.setState(CONNECTED)

      // The disconnected browser is already part of the collection.
      // Update the collection view in the UI (header on client.html)
      this.emitter.emit('browsers_change', this.collection)
      // Notify the launcher
      this.emitter.emit('browser_register', this)
      // Execute tests if configured to do so.
      if (this.singleRun) {
        this.execute()
      }
    } else if (this.state === EXECUTING_DISCONNECTED) {
      this.log.debug('Lost socket connection, but browser continued to execute. Reconnected ' +
        `on socket ${newSocket.id}.`)
      this.setState(EXECUTING)
    } else if ([CONNECTED, CONFIGURING, EXECUTING].includes(this.state)) {
      this.log.debug(`Rebinding to new socket ${newSocket.id} (already have ` +
        `${this.getActiveSocketsIds()})`)
    }

    if (!this.activeSockets.some((s) => s.id === newSocket.id)) {
      this.activeSockets.push(newSocket)
      this.bindSocketEvents(newSocket)
    }

    if (this.pendingDisconnect) {
      this.timer.clearTimeout(this.pendingDisconnect)
    }

    this.refreshNoActivityTimeout()
  }

  onResult (result) {
    if (Array.isArray(result)) {
      result.forEach(this.onResult, this)
    } else if (this.isNotConnected()) {
      this.lastResult.add(result)
      this.emitter.emit('spec_complete', this, result)
    }
    this.refreshNoActivityTimeout()
  }

  execute () {
    this.activeSockets.forEach((socket) => socket.emit('execute', this.clientConfig))
    this.setState(CONFIGURING)
    this.refreshNoActivityTimeout()
  }

  getActiveSocketsIds () {
    return this.activeSockets.map((s) => s.id).join(', ')
  }

  disconnect (reason) {
    this.log.warn(`Disconnected (${this.disconnectsCount} times) ${reason || ''}`)
    this.disconnectsCount++
    this.emitter.emit('browser_error', this, `Disconnected ${reason || ''}`)
    this.remove()
  }

  remove () {
    this.setState(DISCONNECTED)
    this.collection.remove(this)
  }

  refreshNoActivityTimeout () {
    if (this.noActivityTimeout) {
      this.clearNoActivityTimeout()

      this.noActivityTimeoutId = this.timer.setTimeout(() => {
        this.lastResult.totalTimeEnd()
        this.lastResult.disconnected = true
        this.disconnect(`, because no message in ${this.noActivityTimeout} ms.`)
        this.emitter.emit('browser_complete', this)
      }, this.noActivityTimeout)
    }
  }

  clearNoActivityTimeout () {
    if (this.noActivityTimeout && this.noActivityTimeoutId) {
      this.timer.clearTimeout(this.noActivityTimeoutId)
      this.noActivityTimeoutId = null
    }
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
      noActivityTimeout: this.noActivityTimeout,
      disconnectDelay: this.disconnectDelay
    }
  }
}

Browser.factory = function (
  id, fullName, /* capturedBrowsers */ collection, emitter, socket, timer,
  /* config.browserDisconnectTimeout */ disconnectDelay,
  /* config.browserNoActivityTimeout */ noActivityTimeout,
  /* config.singleRun */ singleRun,
  /* config.client */ clientConfig) {
  return new Browser(id, fullName, collection, emitter, socket, timer,
    disconnectDelay, noActivityTimeout, singleRun, clientConfig)
}

Browser.STATE_CONNECTED = CONNECTED
Browser.STATE_CONFIGURING = CONFIGURING
Browser.STATE_EXECUTING = EXECUTING
Browser.STATE_EXECUTING_DISCONNECTED = EXECUTING_DISCONNECTED
Browser.STATE_DISCONNECTED = DISCONNECTED

module.exports = Browser
