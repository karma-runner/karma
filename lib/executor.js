'use strict'

const log = require('./logger').create()

class Executor {
  constructor (capturedBrowsers, config, emitter) {
    this.capturedBrowsers = capturedBrowsers
    this.config = config
    this.emitter = emitter

    this.executionScheduled = false
    this.pendingCount = 0
    this.runningBrowsers = null

    // bind all the events
    this.emitter.on('run_complete', () => this.onRunComplete())
    this.emitter.on('browser_complete', () => this.onBrowserComplete())
  }

  schedule () {
    const nonReady = []

    if (!this.capturedBrowsers.length) {
      log.warn('No captured browser, open %s//%s:%s%s', this.config.protocol, this.config.hostname,
        this.config.port, this.config.urlRoot)
      return false
    }

    if (this.capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing')
      log.debug('Captured %s browsers', this.capturedBrowsers.length)
      this.executionScheduled = false
      this.capturedBrowsers.clearResults()
      this.pendingCount = this.capturedBrowsers.length
      this.runningBrowsers = this.capturedBrowsers.clone()
      this.emitter.emit('run_start', this.runningBrowsers)
      this.socketIoSockets.emit('execute', this.config.client)
      return true
    }

    log.info('Delaying execution, these browsers are not ready: ' + nonReady.join(', '))
    this.executionScheduled = true
    return false
  }

  onRunComplete () {
    if (this.executionScheduled) {
      this.schedule()
    }
  }

  onBrowserComplete () {
    this.pendingCount--

    if (!this.pendingCount) {
      // Ensure run_complete is emitted in the next tick
      // so it is never emitted before browser_complete
      setTimeout(() => {
        this.emitter.emit('run_complete', this.runningBrowsers, this.runningBrowsers.getResults())
      }, 0)
    }
  }
}

Executor.factory = function (capturedBrowsers, config, emitter) {
  return new Executor(capturedBrowsers, config, emitter)
}

module.exports = Executor
