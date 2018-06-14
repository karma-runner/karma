var ProgressReporter = require('./progress')
var BaseColorReporter = require('./base_color')

function ProgressColorReporter (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  ProgressReporter.call(this, formatError, reportSlow, useColors, browserConsoleLogOptions)
  BaseColorReporter.call(this)
  this.EXCLUSIVELY_USE_COLORS = true
}

// PUBLISH
module.exports = ProgressColorReporter
