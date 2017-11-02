// This is the **logger** module for *Karma*. It uses
// [log4js](https://github.com/nomiddlename/log4js-node) to handle and
// configure all logging that happens inside of *Karma*.

// ### Helpers and Setup

var log4js = require('log4js')
var helper = require('./helper')
var constant = require('./constants')

// #### Public Functions

// Setup the logger by passing in the configuration options. It needs
// three arguments:
//
//     setup(logLevel, colors, appenders)
//
// * `logLevel`: *String* Defines the global log level.
// * `colors`: *Boolean* Use colors in the stdout or not.
// * `appenders`: *Object*  This will be passed as appenders to log4js
//   to allow for fine grained configuration of log4js. For more information
//   see https://github.com/nomiddlename/log4js-node.
//   *Array* is also accepted for backwards compatibility.
var setup = function (level, colors, appenders) {
  // Turn color on/off on the console appenders with pattern layout
  var pattern = colors ? constant.COLOR_PATTERN : constant.NO_COLOR_PATTERN
  if (appenders) {
    // Convert Array to Object for backwards compatibility.
    if (appenders['map']) {
      if (appenders.length === 0) {
        appenders = [constant.CONSOLE_APPENDER]
      }
      const v1Appenders = appenders
      appenders = {}
      v1Appenders.forEach(function (appender, index) {
        if (appender.type === 'console') {
          appenders['console'] = appender
          if (helper.isDefined(appender.layout) && appender.layout.type === 'pattern') {
            appender.layout.pattern = pattern
          }
        } else {
          appenders[index + ''] = appender
        }
        return appender
      })
    }
  } else {
    appenders = {'console' : constant.CONSOLE_APPENDER}
  }

  log4js.configure({
    appenders: appenders,
    categories: {
      'default': {
        'appenders': Object.keys(appenders),
        'level': level
      }
    }
  })
}

// Setup the logger by passing in the config object. The function sets the
// `colors` and `logLevel` if they are defined. It takes two arguments:
//
//     setupFromConfig(config, appenders)
//
// * `config`: *Object* The configuration object.
// * `appenders`: *Object*  This will be passed as appenders to log4js
//   to allow for fine grained configuration of log4js. For more information
//   see https://github.com/nomiddlename/log4js-node.
//   *Array* is also accepted for backwards compatibility.
var setupFromConfig = function (config, appenders) {
  var useColors = true
  var logLevel = constant.LOG_INFO

  if (helper.isDefined(config.colors)) {
    useColors = config.colors
  }

  if (helper.isDefined(config.logLevel)) {
    logLevel = config.logLevel
  }
  setup(logLevel, useColors, appenders)
}

const loggerCache = {}

// Create a new logger. There are two optional arguments
// * `name`, which defaults to `karma` and
//   If the `name = 'socket.io'` this will create a special wrapper
//   to be used as a logger for socket.io.
// * `level`, which defaults to the global level.
var create = function (name, level) {
  name = name || 'karma'
  var logger
  if (loggerCache.hasOwnProperty(name)) {
    logger = loggerCache[name]
  } else {
    logger = log4js.getLogger(name)
    loggerCache[name] = logger
  }
  if (helper.isDefined(level)) {
    logger.setLevel(level)
  }
  return logger
}

// #### Publish

exports.create = create
exports.setup = setup
exports.setupFromConfig = setupFromConfig
exports._rebindLog4js4testing = function(mockLog4js) {
  log4js = mockLog4js
}
