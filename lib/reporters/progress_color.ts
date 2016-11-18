import {ProgressReporter} from './progress'
import {BaseColorReporter} from './base_color'

export class ProgressColorReporter extends ProgressReporter {
  constructor(formatError, reportSlow, useColors, browserConsoleLogOptions) {
    super(formatError, reportSlow, useColors, browserConsoleLogOptions)
    BaseColorReporter.call(this)
    this.EXCLUSIVELY_USE_COLORS = true
  }
}