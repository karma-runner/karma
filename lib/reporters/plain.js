var BaseReporter = require('./base')

var PlainReporter = function (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  BaseReporter.call(this, formatError, reportSlow, useColors, browserConsoleLogOptions)

  this.EXCLUSIVELY_USE_COLORS = false
  this.onRunStart = function () {
    this._browsers = []
  }

  this.onBrowserStart = function (browser) {
    this._browsers.push(browser)
  }

  this.writeCommonMsg = function (msg) {
    this.write(msg)
  }

  this.specSuccess = function () {}

  this.onBrowserComplete = function (browser) {
    this.writeCommonMsg(this.renderBrowser(browser) + '\n')
  }

  this.onRunComplete = function (browsers, results) {
    if (browsers.length > 1 && !results.disconnected && !results.error) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success)
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success)
      }
    }
  }
}

// PUBLISH
module.exports = PlainReporter
