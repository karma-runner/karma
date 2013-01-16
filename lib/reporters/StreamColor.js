var StreamReporter = require('./Stream');
var BaseColorReporter = require('./BaseColor');


var StreamColorReporter = function(formatError, reportSlow) {
  StreamReporter.call(this, formatError, reportSlow);
  BaseColorReporter.call(this);
};


// PUBLISH
module.exports = StreamColorReporter;
