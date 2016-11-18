import {BaseReporter} from './base'

export class ProgressReporter extends BaseReporter {
  private _isRendered

  constructor(formatError, reportSlow, useColors, browserConsoleLogOptions) {
    super(formatError, reportSlow, useColors, browserConsoleLogOptions)

    this.EXCLUSIVELY_USE_COLORS = false
  }

  writeCommonMsg = (msg) => {
    this.write(this._remove() + msg + this._render())
  }

  specSuccess = () => {
    this.write(this._refresh())
  }

  onBrowserComplete = () => {
    this.write(this._refresh())
  }

  onRunStart = () => {
    this._browsers = []
    this._isRendered = false
  }

  onBrowserStart = (browser) => {
    this._browsers.push(browser)

    if (this._isRendered) {
      this.write('\n')
    }

    this.write(this._refresh())
  }

  _remove() {
    if (!this._isRendered) {
      return ''
    }

    var cmd = ''
    this._browsers.forEach(function () {
      cmd += '\x1B[1A' + '\x1B[2K'
    })

    this._isRendered = false

    return cmd
  }

  _render() {
    this._isRendered = true

    return this._browsers.map(this.renderBrowser).join('\n') + '\n'
  }

  _refresh() {
    return this._remove() + this._render()
  }
}
