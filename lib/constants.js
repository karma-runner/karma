import * as fs from 'graceful-fs'
import * as path from 'path'

var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '/../package.json')).toString())

export const VERSION = pkg.version

export const DEFAULT_PORT = process.env.PORT || 9876
export const DEFAULT_HOSTNAME = process.env.IP || 'localhost'
export const DEFAULT_LISTEN_ADDR = process.env.LISTEN_ADDR || '0.0.0.0'

// log levels
export const LOG_DISABLE = 'OFF'
export const LOG_ERROR = 'ERROR'
export const LOG_WARN = 'WARN'
export const LOG_INFO = 'INFO'
export const LOG_DEBUG = 'DEBUG'
export const LOG_LOG = 'LOG'
export const LOG_PRIORITIES = [
  LOG_DISABLE,
  LOG_ERROR,
  LOG_WARN,
  LOG_INFO,
  LOG_DEBUG,
  LOG_LOG
]

// Default patterns for the pattern layout.
export const COLOR_PATTERN = '%[%d{DATE}:%p [%c]: %]%m'
export const NO_COLOR_PATTERN = '%d{DATE}:%p [%c]: %m'

// Default console appender
export const CONSOLE_APPENDER = {
  type: 'console',
  layout: {
    type: 'pattern',
    pattern: COLOR_PATTERN
  }
}

export const EXIT_CODE = '\x1FEXIT'
