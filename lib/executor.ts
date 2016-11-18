import {create} from './logger'
import {ConfigOptions} from './config-options'
import {BrowserCollection} from './browser_collection'
var log = create()

export class Executor {
  socketIoSockets

  constructor(private capturedBrowsers: BrowserCollection, private config: ConfigOptions, private emitter) {
    // bind all the events
    emitter.bind(this)
  }

  private executionScheduled = false
  private pendingCount = 0
  private runningBrowsers

  schedule = () => {
    var nonReady = []

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
      this.capturedBrowsers.setAllToExecuting()
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

  onRunComplete = () => {
    if (this.executionScheduled) {
      this.schedule()
    }
  }

  onBrowserComplete = () => {
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
