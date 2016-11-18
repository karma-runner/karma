import util = require('util')

import helper = require('../helper')

export class BaseReporter {
  private adapters
  _browsers

  constructor(private formatError, private reportSlow, private useColors, private browserConsoleLogOptions, adapter?) {
    this.adapters = [adapter || process.stdout.write.bind(process.stdout)]

    this.renderBrowser = this.renderBrowser.bind(this)
  }

  onRunStart = () => {
    this._browsers = []
  }

  onBrowserStart = (browser) => {
    this._browsers.push(browser)
  }

  renderBrowser = (browser) => {
    var results = browser.lastResult
    var totalExecuted = results.success + results.failed
    var msg = util.format('%s: Executed %d of %d', browser, totalExecuted, results.total)

    if (results.failed) {
      msg += util.format(this.X_FAILED, results.failed)
    }

    if (results.skipped) {
      msg += util.format(' (skipped %d)', results.skipped)
    }

    if (browser.isReady) {
      if (results.disconnected) {
        msg += this.FINISHED_DISCONNECTED
      } else if (results.error) {
        msg += this.FINISHED_ERROR
      } else if (!results.failed) {
        msg += this.FINISHED_SUCCESS
      }

      msg += util.format(' (%s / %s)', helper.formatTimeInterval(results.totalTime),
        helper.formatTimeInterval(results.netTime))
    }

    return msg
  }

  write = (..._arguments) => {
    var msg = util.format.apply(null, Array.prototype.slice.call(_arguments))
    var self = this
    this.adapters.forEach((adapter) => {
      if (!helper.isDefined(adapter.colors)) {
        adapter.colors = this.useColors
      }
      if (!helper.isDefined(self.EXCLUSIVELY_USE_COLORS) || adapter.colors === self.EXCLUSIVELY_USE_COLORS) {
        return adapter(msg)
      }
    })
  }

  writeCommonMsg = this.write

  onBrowserError = (browser, error) => {
    this.writeCommonMsg(util.format(this.ERROR, browser) + this.formatError(error, '  '))
  }

  onBrowserLog = (browser, log, type) => {
    if (!this.browserConsoleLogOptions || !this.browserConsoleLogOptions.terminal) return
    if (!helper.isString(log)) {
      // TODO(vojta): change util to new syntax (config object)
      log = util.inspect(log, false, undefined, this.USE_COLORS)
    }
    if (this._browsers && this._browsers.length === 1) {
      this.writeCommonMsg(util.format(this.LOG_SINGLE_BROWSER, type.toUpperCase(), log))
    } else {
      this.writeCommonMsg(util.format(this.LOG_MULTI_BROWSER, browser, type.toUpperCase(), log))
    }
  }

  onSpecComplete = (browser, result) => {
    if (result.skipped) {
      this.specSkipped(browser, result)
    } else if (result.success) {
      this.specSuccess(browser, result)
    } else {
      this.specFailure(browser, result)
    }

    if (this.reportSlow && result.time > this.reportSlow) {
      var specName = result.suite.join(' ') + ' ' + result.description
      var time = helper.formatTimeInterval(result.time)

      this.writeCommonMsg(util.format(this.SPEC_SLOW, browser, time, specName))
    }
  }

  specSkipped = (browser, result) => {
  }

  specSuccess = this.specSkipped

  specFailure = (browser, result) => {
    var specName = result.suite.join(' ') + ' ' + result.description
    var msg = util.format(this.SPEC_FAILURE, browser, specName)

    result.log.forEach((log) => {
      msg += this.formatError(log, '\t')
    })

    this.writeCommonMsg(msg)
  }

  onRunComplete = (browsers, results) => {
    if (browsers.length > 1 && !results.error && !results.disconnected) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success)
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success)
      }
    }
  }

  USE_COLORS = false
  EXCLUSIVELY_USE_COLORS = undefined
  LOG_SINGLE_BROWSER = '%s: %s\n'
  LOG_MULTI_BROWSER = '%s %s: %s\n'

  SPEC_FAILURE = '%s %s FAILED' + '\n'
  SPEC_SLOW = '%s SLOW %s: %s\n'
  ERROR = '%s ERROR\n'

  FINISHED_ERROR = ' ERROR'
  FINISHED_SUCCESS = ' SUCCESS'
  FINISHED_DISCONNECTED = ' DISCONNECTED'

  X_FAILED = ' (%d FAILED)'

  TOTAL_SUCCESS = 'TOTAL: %d SUCCESS\n'
  TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS\n'

  static decoratorFactory(formatError, reportSlow, useColors, browserConsoleLogOptions) {
    return self => BaseReporter.call(self, formatError, reportSlow, useColors, browserConsoleLogOptions)
  }
}

BaseReporter.decoratorFactory.$inject = [
  'formatError',
  'config.reportSlowerThan',
  'config.colors',
  'config.browserConsoleLogOptions'
]
