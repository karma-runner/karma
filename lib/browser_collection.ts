import {Browser} from './browser'
var EXECUTING = Browser.STATE_EXECUTING
import {Result} from './browser_result'

export class BrowserCollection {
  constructor(private emitter?,
              private browsers = []) {
  }

  add = (browser) => {
    this.browsers.push(browser)
    this.emitter.emit('browsers_change', this)
  }

  remove(browser) {
    var index = this.browsers.indexOf(browser)

    if (index === -1) {
      return false
    }

    this.browsers.splice(index, 1)
    this.emitter.emit('browsers_change', this)

    return true
  }

  getById(browserId) {
    for (var i = 0; i < this.browsers.length; i++) {
      if (this.browsers[i].id === browserId) {
        return this.browsers[i]
      }
    }

    return null
  }

  setAllToExecuting() {
    this.browsers.forEach(browser => browser.state = EXECUTING)

    this.emitter.emit('browsers_change', this)
  }

  areAllReady(nonReadyList) {
    nonReadyList = nonReadyList || []

    this.browsers.forEach(browser => {
      if (!browser.isReady()) {
        nonReadyList.push(browser)
      }
    })

    return nonReadyList.length === 0
  }

  serialize() {
    return this.browsers.map(browser => browser.serialize())
  }

  getResults() {
    var results = this.browsers.reduce(function (previous, current) {
      previous.success += current.lastResult.success
      previous.failed += current.lastResult.failed
      previous.error = previous.error || current.lastResult.error
      previous.disconnected = previous.disconnected || current.lastResult.disconnected
      return previous
    }, {success: 0, failed: 0, error: false, disconnected: false, exitCode: 0})

    // compute exit status code
    results.exitCode = results.failed || results.error || results.disconnected ? 1 : 0

    return results
  }

  // TODO(vojta): can we remove this? (we clear the results per browser in onBrowserStart)
  clearResults() {
    this.browsers.forEach(browser => browser.lastResult = new Result())
  }

  clone() {
    return new BrowserCollection(this.emitter, this.browsers.slice())
  }

  // Array APIs
  map(callback, context) {
    return this.browsers.map(callback, context)
  }

  forEach(callback, context) {
    return this.browsers.forEach(callback, context)
  }

  // this.length
  get length() {
    return this.browsers.length
  }

  static $inject = ['emitter']
}
