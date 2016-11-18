import {DotsReporter} from './dots'
import {BaseColorReporter} from './base_color'

export class DotsColorReporter extends DotsReporter {
  constructor(formatError, reportSlow, useColors, browserConsoleLogOptions) {
    super(formatError, reportSlow, useColors, browserConsoleLogOptions)
    BaseColorReporter.call(this)
    this.EXCLUSIVELY_USE_COLORS = true
  }
}