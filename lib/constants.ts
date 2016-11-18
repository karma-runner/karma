var fs = require('graceful-fs')
import path = require('path')

var pkg = require('../package.json')

export const VERSION = pkg.version

export const DEFAULT_PORT = process.env.PORT || 9876
export const DEFAULT_HOSTNAME = process.env.IP || 'localhost'

// log levels
export const LOG_DISABLE = 'OFF'
export const LOG_ERROR = 'ERROR'
export const LOG_WARN = 'WARN'
export const LOG_INFO = 'INFO'
export const LOG_DEBUG = 'DEBUG'

// Default patterns for the pattern layout.
export const COLOR_PATTERN = '%[%d{DATE}:%p [%c]: %]%m'
export const NO_COLOR_PATTERN = '%d{DATE}:%p [%c]: %m'

// Default console appender
export const CONSOLE_APPENDER = {
  type: 'console',
  layout: {
    type: 'pattern',
    pattern: exports.COLOR_PATTERN
  }
}

export const EXIT_CODE = '\x1FEXIT'
