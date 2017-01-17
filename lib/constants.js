var fs = require('graceful-fs')
var path = require('path')

var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '/../package.json')).toString())

exports.VERSION = pkg.version

exports.DEFAULT_PORT = process.env.PORT || 9876
exports.DEFAULT_HOSTNAME = process.env.IP || 'localhost'
exports.DEFAULT_LISTEN_ADDR = process.env.LISTEN_ADDR || '0.0.0.0'

// log levels
exports.LOG_DISABLE = 'OFF'
exports.LOG_ERROR = 'ERROR'
exports.LOG_WARN = 'WARN'
exports.LOG_INFO = 'INFO'
exports.LOG_DEBUG = 'DEBUG'
exports.LOG_LOG = 'LOG'
exports.LOG_PRIORITIES = [
  exports.LOG_DISABLE,
  exports.LOG_ERROR,
  exports.LOG_WARN,
  exports.LOG_INFO,
  exports.LOG_DEBUG,
  exports.LOG_LOG
]

// Default patterns for the pattern layout.
exports.COLOR_PATTERN = '%[%d{DATE}:%p [%c]: %]%m'
exports.NO_COLOR_PATTERN = '%d{DATE}:%p [%c]: %m'

// Default console appender
exports.CONSOLE_APPENDER = {
  type: 'console',
  layout: {
    type: 'pattern',
    pattern: exports.COLOR_PATTERN
  }
}

exports.EXIT_CODE = '\x1FEXIT'
