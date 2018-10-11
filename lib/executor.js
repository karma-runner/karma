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

    this.emitter.on('run_complete', () => this.onRunComplete())
    this.emitter.on('browser_complete', () => this.onBrowserComplete())
  }

  schedule () {
    if (this.capturedBrowsers.length === 0) {
      log.warn(`No captured browser, open ${this.config.protocol}//${this.config.hostname}:${this.config.port}${this.config.urlRoot}`)
      return false
    } else if (this.capturedBrowsers.areAllReady()) {
      log.debug('All browsers are ready, executing')
      log.debug(`Captured ${this.capturedBrowsers.length} browsers`)
      this.executionScheduled = false
      this.capturedBrowsers.clearResults()
      this.pendingCount = this.capturedBrowsers.length
      this.runningBrowsers = this.capturedBrowsers.clone()
      this.emitter.emit('run_start', this.runningBrowsers)
      this.socketIoSockets.emit('execute', this.config.client)
      return true
    } else {
      log.info('Delaying execution, these browsers are not ready: ' + this.capturedBrowsers.getNonReady().join(', '))
      this.executionScheduled = true
      return false
    }
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
      })
    }
  }
}

Executor.factory = function (capturedBrowsers, config, emitter) {
  return new Executor(capturedBrowsers, config, emitter)
}

module.exports = Executor
