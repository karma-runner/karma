const DotsReporter = require('./dots')
const BaseColorReporter = require('./base_color')

function DotsColorReporter (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  DotsReporter.call(this, formatError, reportSlow, useColors, browserConsoleLogOptions)
  BaseColorReporter.call(this)
  this.EXCLUSIVELY_USE_COLORS = true
}

// PUBLISH
module.exports = DotsColorReporter
