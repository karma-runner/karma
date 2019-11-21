'use strict'

const log = require('./logger').create()

class Executor {
  constructor (capturedBrowsers, config, emitter) {
    this.capturedBrowsers = capturedBrowsers
    this.config = config
    this.emitter = emitter

    this.executionScheduled = false
    this.errorsScheduled = []
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

  /**
   * Schedule an error to be reported
   * @param {string} errorMessage
   * @returns {boolean} a boolean indicating whether or not the error was handled synchronously
   */
  scheduleError (errorMessage) {
    // We don't want to interfere with any running test.
    // Verify that no test is running before reporting the error.
    if (this.capturedBrowsers.areAllReady()) {
      log.warn(errorMessage)
      const errorResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        error: errorMessage,
        exitCode: 1
      }
      const noBrowsersStartedTests = []
      this.emitter.emit('run_start', noBrowsersStartedTests) // A run cannot complete without being started
      this.emitter.emit('run_complete', noBrowsersStartedTests, errorResult)
      return true
    } else {
      this.errorsScheduled.push(errorMessage)
      return false
    }
  }

  onRunComplete () {
    if (this.executionScheduled) {
      this.schedule()
    }
    if (this.errorsScheduled.length) {
      const errorsToReport = this.errorsScheduled
      this.errorsScheduled = []
      errorsToReport.forEach((error) => this.scheduleError(error))
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
