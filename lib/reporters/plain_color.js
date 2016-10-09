var PlainReporter = require('./plain')
var BaseColorReporter = require('./base_color')

var PlainColorReporter = function (formatError, reportSlow, useColors, browserConsoleLogOptions) {
  PlainReporter.call(this, formatError, reportSlow, useColors, browserConsoleLogOptions)
  BaseColorReporter.call(this)
  this.EXCLUSIVELY_USE_COLORS = true
}

// PUBLISH
module.exports = PlainColorReporter
