import {BaseReporter} from './base'

export class DotsReporter extends BaseReporter {
  private _dotsCount

  constructor(formatError, reportSlow, useColors, browserConsoleLogOptions) {
    super(formatError, reportSlow, useColors, browserConsoleLogOptions)
  }

  private DOTS_WRAP = 80
  EXCLUSIVELY_USE_COLORS = false
  onRunStart = () => {
    this._browsers = []
    this._dotsCount = 0
  }

  onBrowserStart = (browser) => {
    this._browsers.push(browser)
  }

  writeCommonMsg = (msg) => {
    if (this._dotsCount) {
      this._dotsCount = 0
      msg = '\n' + msg
    }

    this.write(msg)
  }

  specSuccess = () => {
    this._dotsCount = (this._dotsCount + 1) % this.DOTS_WRAP
    this.write(this._dotsCount ? '.' : '.\n')
  }

  onBrowserComplete = (browser) => {
    this.writeCommonMsg(this.renderBrowser(browser) + '\n')
  }

  onRunComplete = (browsers, results) => {
    if (browsers.length > 1 && !results.disconnected && !results.error) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success)
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success)
      }
    }
  }
}
