'use strict'

const BrowserResult = require('./browser_result')
const helper = require('./helper')

class BrowserCollection {
  constructor (emitter, browsers = []) {
    this.browsers = browsers
    this.emitter = emitter
  }

  add (browser) {
    this.browsers.push(browser)
    this.emitter.emit('browsers_change', this)
  }

  remove (browser) {
    if (helper.arrayRemove(this.browsers, browser)) {
      this.emitter.emit('browsers_change', this)
      return true
    }
    return false
  }

  getById (browserId) {
    return this.browsers.find((browser) => browser.id === browserId) || null
  }

  getNonReady () {
    return this.browsers.filter((browser) => !browser.isConnected())
  }

  areAllReady () {
    return this.browsers.every((browser) => browser.isConnected())
  }

  serialize () {
    return this.browsers.map((browser) => browser.serialize())
  }

  calculateExitCode (results, singleRunBrowserNotCaptured, config) {
    config = config || {}
    if (results.disconnected || singleRunBrowserNotCaptured) {
      return 1
    }
    if (results.skipped && config.failOnSkippedTests) {
      return 1
    }
    if (results.success + results.failed === 0 && !!config.failOnEmptyTestSuite) {
      return 1
    }
    if (results.error) {
      return 1
    }
    if (config.failOnFailingTestSuite === false) {
      return 0 // Tests executed without infrastructure error, exit with 0 independent of test status.
    }
    return results.failed ? 1 : 0
  }

  getResults (singleRunBrowserNotCaptured, config) {
    const results = { success: 0, failed: 0, skipped: 0, error: false, disconnected: false, exitCode: 0 }
    this.browsers.forEach((browser) => {
      results.success += browser.lastResult.success
      results.failed += browser.lastResult.failed
      results.skipped += browser.lastResult.skipped
      results.error = results.error || browser.lastResult.error
      results.disconnected = results.disconnected || browser.lastResult.disconnected
    })

    results.exitCode = this.calculateExitCode(results, singleRunBrowserNotCaptured, config)
    return results
  }

  clearResults () {
    this.browsers.forEach((browser) => {
      browser.lastResult = new BrowserResult()
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
