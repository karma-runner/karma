'use strict'

const util = require('util')

const constants = require('../constants')
const helper = require('../helper')

const BaseReporter = function (formatError, reportSlow, useColors, browserConsoleLogOptions, adapter) {
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)]

  this.USE_COLORS = false
  this.EXCLUSIVELY_USE_COLORS = undefined
  this.LOG_SINGLE_BROWSER = '%s: %s\n'
  this.LOG_MULTI_BROWSER = '%s %s: %s\n'

  this.SPEC_FAILURE = '%s %s FAILED' + '\n'
  this.SPEC_SLOW = '%s SLOW %s: %s\n'
  this.ERROR = '%s ERROR\n'

  this.FINISHED_ERROR = ' ERROR'
  this.FINISHED_SUCCESS = ' SUCCESS'
  this.FINISHED_DISCONNECTED = ' DISCONNECTED'

  this.X_FAILED = ' (%d FAILED)'

  this.TOTAL_SUCCESS = 'TOTAL: %d SUCCESS\n'
  this.TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS\n'

  this.onRunStart = () => {
    this._browsers = []
  }

  this.onBrowserStart = (browser) => {
    this._browsers.push(browser)
  }

  this.renderBrowser = (browser) => {
    const results = browser.lastResult
    const totalExecuted = results.success + results.failed
    let msg = `${browser}: Executed ${totalExecuted} of ${results.total}`

    if (results.failed) {
      msg += util.format(this.X_FAILED, results.failed)
    }

    if (results.skipped) {
      msg += ` (skipped ${results.skipped})`
    }

    if (browser.isConnected) {
      if (results.disconnected) {
        msg += this.FINISHED_DISCONNECTED
      } else if (results.error) {
        msg += this.FINISHED_ERROR
      } else if (!results.failed) {
        msg += this.FINISHED_SUCCESS
      }

      msg += ` (${helper.formatTimeInterval(results.totalTime)} / ${helper.formatTimeInterval(results.netTime)})`
    }

    return msg
  }

  this.write = function () {
    const msg = util.format.apply(null, Array.prototype.slice.call(arguments))
    this.adapters.forEach((adapter) => {
      if (!helper.isDefined(adapter.colors)) {
        adapter.colors = useColors
      }
      if (!helper.isDefined(this.EXCLUSIVELY_USE_COLORS) || adapter.colors === this.EXCLUSIVELY_USE_COLORS) {
        return adapter(msg)
      }
    })
  }

  this.writeCommonMsg = function () {
    this.write.apply(this, arguments)
  }

  this.onBrowserError = (browser, error) => {
    this.writeCommonMsg(util.format(this.ERROR, browser) + formatError(error, '  '))
  }

  this.onBrowserLog = (browser, log, type) => {
    if (!browserConsoleLogOptions || !browserConsoleLogOptions.terminal) return
    type = type.toUpperCase()
    if (browserConsoleLogOptions.level) {
      const logPriority = constants.LOG_PRIORITIES.indexOf(browserConsoleLogOptions.level.toUpperCase())
      if (constants.LOG_PRIORITIES.indexOf(type) > logPriority) return
    }
    if (!helper.isString(log)) {
      // TODO(vojta): change util to new syntax (config object)
      log = util.inspect(log, false, undefined, this.USE_COLORS)
    }
    if (this._browsers && this._browsers.length === 1) {
      this.writeCommonMsg(util.format(this.LOG_SINGLE_BROWSER, type, log))
    } else {
      this.writeCommonMsg(util.format(this.LOG_MULTI_BROWSER, browser, type, log))
    }
  }

  this.onSpecComplete = (browser, result) => {
    if (result.skipped) {
      this.specSkipped(browser, result)
    } else if (result.success) {
      this.specSuccess(browser, result)
    } else {
      this.specFailure(browser, result)
    }

    if (reportSlow && result.time > reportSlow) {
      const specName = result.suite.join(' ') + ' ' + result.description
      const time = helper.formatTimeInterval(result.time)

      this.writeCommonMsg(util.format(this.SPEC_SLOW, browser, time, specName))
    }
  }

  this.specSuccess = () => {
  }

  this.specSkipped = () => {
  }

  this.specFailure = (browser, result) => {
    const specName = result.suite.join(' ') + ' ' + result.description
    let msg = util.format(this.SPEC_FAILURE, browser, specName)

    result.log.forEach((log) => {
      msg += formatError(log, '\t')
    })

    this.writeCommonMsg(msg)
  }

  this.onRunComplete = (browsers, results) => {
    if (browsers.length >= 1 && !results.error && !results.disconnected) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success)
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success)
      }
    }
  }
}

BaseReporter.decoratorFactory = function (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  return function (self) {
    BaseReporter.call(self, formatError, reportSlow, useColors, browserConsoleLogOptions)
  }
}

BaseReporter.decoratorFactory.$inject = [
  'formatError',
  'config.reportSlowerThan',
  'config.colors',
  'config.browserConsoleLogOptions'
]

// PUBLISH
module.exports = BaseReporter
