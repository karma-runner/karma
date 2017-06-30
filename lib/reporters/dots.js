var BaseReporter = require('./base')

var DotsReporter = function (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  BaseReporter.call(this, formatError, reportSlow, useColors, browserConsoleLogOptions)

  var mutedCommonMsg = browserConsoleLogOptions && browserConsoleLogOptions.muteCommonMsg && browserConsoleLogOptions.muteCommonMsg.dots

  var DOTS_WRAP = 80
  this.EXCLUSIVELY_USE_COLORS = false
  this.onRunStart = function () {
    this._browsers = []
    this._dotsCount = 0
  }

  this.onBrowserStart = function (browser) {
    this._browsers.push(browser)
  }

  this.writeCommonMsg = function (msg, force) {
    if (this._dotsCount) {
      this._dotsCount = 0
      msg = '\n' + msg
    }

    if (!mutedCommonMsg || force) {
      this.write(msg)
    }
  }

  this.specSuccess = function () {
    this._dotsCount = (this._dotsCount + 1) % DOTS_WRAP
    this.write(this._dotsCount ? '.' : '.\n')
  }

  this.onBrowserComplete = function (browser) {
    this.writeCommonMsg(this.renderBrowser(browser) + '\n', true)
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
module.exports = DotsReporter
