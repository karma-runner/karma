// Custom appender to be loaded with log4js.loadAppender().
//
// This is the same as the 'console' appender except that ERROR level events are
// logged with console.error.

var log4js = require('log4js');
var layouts = log4js.layouts;
var consoleLog = console.log.bind(console);
var consoleError = console.error.bind(console);

function stdAppender(layout) {
  layout = layout || layouts.colouredLayout;
  return function(loggingEvent) {
    if (loggingEvent.level === log4js.levels.ERROR) {
      consoleError(layout(loggingEvent));
    } else {
      consoleLog(layout(loggingEvent));
    }
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return stdAppender(layout);
}

exports.appender = stdAppender;
exports.configure = configure;
