var DotsReporter = require('./dots')
var BaseColorReporter = require('./base_color')

var DotsColorReporter = function (formatError, reportSlow, useColors) {
  DotsReporter.call(this, formatError, reportSlow, useColors)
  BaseColorReporter.call(this)
}

// PUBLISH
module.exports = DotsColorReporter
