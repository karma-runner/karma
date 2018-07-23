'use strict'

const Result = require('./browser_result')

class BrowserCollection {
  constructor (emitter, browsers) {
    this.browsers = browsers || []
    this.emitter = emitter
  }

  add (browser) {
    this.browsers.push(browser)
    this.emitter.emit('browsers_change', this)
  }

  remove (browser) {
    const index = this.browsers.indexOf(browser)

    if (index === -1) {
      return false
    }

    this.browsers.splice(index, 1)
    this.emitter.emit('browsers_change', this)

    return true
  }

  getById (browserId) {
    return this.browsers.find((browser) => browser.id === browserId) || null
  }

  areAllReady (nonReadyList) {
    nonReadyList = nonReadyList || []

    this.browsers.forEach((browser) => {
      if (!browser.isConnected()) {
        nonReadyList.push(browser)
      }
    })

    return nonReadyList.length === 0
  }

  serialize () {
    return this.browsers.map((browser) => browser.serialize())
  }

  getResults () {
    const results = this.browsers.reduce((previous, current) => {
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
  clearResults () {
    this.browsers.forEach((browser) => {
      browser.lastResult = new Result()
    })
  }

  clone () {
    return new BrowserCollection(this.emitter, this.browsers.slice())
  }

  // Array APIs
  map (callback, context) {
    return this.browsers.map(callback, context)
  }

  forEach (callback, context) {
    return this.browsers.forEach(callback, context)
  }

  get length () {
    return this.browsers.length
  }
}

BrowserCollection.factory = function (emitter) {
  return new BrowserCollection(emitter)
}

module.exports = BrowserCollection
