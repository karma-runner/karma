var ProgressReporter = require('./progress')
var BaseColorReporter = require('./base_color')

var ProgressColorReporter = function (formatError, reportSlow, useColors) {
  ProgressReporter.call(this, formatError, reportSlow, useColors)
  BaseColorReporter.call(this)
}

// PUBLISH
module.exports = ProgressColorReporter
