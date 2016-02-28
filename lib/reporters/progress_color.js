var ProgressReporter = require('./progress')
var BaseColorReporter = require('./base_color')

var ProgressColorReporter = function (formatError, reportSlow, useColors) {
  ProgressReporter.call(this, formatError, reportSlow, useColors)
  BaseColorReporter.call(this)
  this.EXCLUSIVELY_USE_COLORS = true
}

// PUBLISH
module.exports = ProgressColorReporter
