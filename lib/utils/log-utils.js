
const constants = require('../constants') // other files assign this to the singular "constant".

const { LOG_DEBUG, LOG_DISABLE, LOG_ERROR, LOG_INFO, LOG_WARN } = constants
const validLogLevels = [
  LOG_DEBUG,
  LOG_DISABLE,
  LOG_ERROR,
  LOG_INFO,
  LOG_WARN
]

// Mutually Exclusive Actions
// QUESTION: Move these to `constants.js`?
const ACTION_LOG = 'log'
const ACTION_LOG_AND_EXIT = 'exit'
const ACTION_THROW = 'throw'
const validActions = [
  ACTION_LOG,
  ACTION_LOG_AND_EXIT,
  ACTION_THROW
]
const actions = {
  ACTION_LOG,
  ACTION_LOG_AND_EXIT,
  ACTION_THROW
}

/**
 * @param {string} levelName
 * @returns {string}
 * @throws {TypeError}
 *
 * @see [levelStr is always uppercase]{@link https://github.com/log4js-node/log4js-node/blob/v6.3.0/lib/levels.js#L49-L54}
 * @see [builtin/default levels]{@link https://github.com/log4js-node/log4js-node/blob/v6.3.0/lib/levels.js#L90-L100}
 * @see [static getLevel(sArg, defaultLevel)]{@link https://github.com/log4js-node/log4js-node/blob/v6.3.0/lib/logger.js#L113-L116}
 * @see [level method name creation]{@link https://github.com/log4js-node/log4js-node/blob/v6.3.0/lib/logger.js#L113-L116}
 */
function getLevelMethodName (levelName) {
  if (typeof levelName !== 'string') {
    throw new TypeError('getLevelMethodName: `levelName` argument must be a string.')
  }
  const levelStrLower = levelName.toLowerCase()
  const levelMethod = levelStrLower.replace(/_([a-z])/g, (g) =>
    g[1].toUpperCase()
  )
  return levelMethod
}

/**
 * Create functions that may be used to handle and log messages.
 *
 * The factory changes the default behavior of the created message function
 * so that the function may be consumed with minimal arguments and options.
 *
 * @param {Object} categoryLogger
 *     One of the internal log4js loggers created by Karma. This logger is used
 *     together with log levels as the default means of logging messages.
 * @param {"exit"|"log"|"throw"} [defaultAction="log"]
 *     If this option is a valid action, then it will be used as the returned
 *     function's default action. Invalid values will result in the default
 *     log level being set to `"log"`.
 * @param {"DEBUG"|"ERROR"|"INFO"|"OFF"|"WARN"} [defaultLevel="INFO"]
 *     If this option is a valid log level, then it will be used as the returned
 *     function's default log level. Invalid values will result in the default
 *     log level being set to `"INFO"`.
 * @param {boolean} [mayExit = true]
 *     If this option is `false`, then process exiting is disabled. All other
 *     values enable process exiting.
 * @param {boolean} [mayThrow = true]
 *     If this option is `false`, then throwing exceptions is disabled. All
 *     other values enable exception throwing.
 * @returns {logMessage}
 *     A function that may be used for handling and logging messages.
 */
function logMessageFactory (
  categoryLogger,
  defaultAction = ACTION_LOG,
  defaultLevel = LOG_INFO,
  mayExit = true,
  mayThrow = true
) {
  const CAN_EXIT = mayExit !== false
  const CAN_THROW = mayThrow !== false
  const DEFAULT_ACTION = validActions.includes(defaultAction)
    ? defaultAction
    : ACTION_LOG
  const DEFAULT_LEVEL = validLogLevels.includes(defaultLevel)
    ? defaultLevel
    : LOG_INFO

  /**
   *
   * A function that may be used to handle and log messages.
   *
   * @param {string} message
   * @param {Object} [options]
   * @param {"exit"|"log"|"throw"} [options.action="log"]
   *     If this option is `"throw"`, then `message` will be used to create an
   *     error object which will then be thrown. If this option is `"log"`, then
   *     the message will be logged using the appropriate function. If this
   *     option is `"exit"`, then the process will exit with `exitCode` after
   *     the message is logged. The default value for this option depends upon
   *     what was passed to the factory. If the factory does not configure it,
   *     then the default value will be `"log"`. If an invalid value is passed,
   *     the default value will be used. The factory can disable throwing and
   *     exiting, which are both enabled by default. If other actions are
   *     disabled, then this function will always be able to log the message.
   * @param {function} [options.errorConstructor]
   *     When throwing an exception an `options.errorInstance` object is not
   *     provided, then this function is used to construct a new error object.
   *     The constructor will be passed `message` as its first argument.
   *     If this option is not a function, the code will then fall back to using
   *     the global `Error` constructor.
   * @param {Object} [options.errorInstance]
   *     When throwing an exception, this error object will have its `message`
   *     property value set to the `message` argument before throwing the
   *     object. If the this option is not an object, the code will then attempt
   *     to use `options.errorConstructor`.
   * @param {number} [options.exitCode=1]
   *     An integer that the process will exit with. By default this will be
   *     `1`. Any exit code that is not `0` will indicate an error. `0`
   *     indicates a success.
   * @param {function} [options.logFunction="INFO"]
   *     If this option is a function, it will be used to log the message
   *     instead of Karma's internal log4js logger. It will be passed `message`
   *     as the first argument. An object with `action`, `error`, and `logLevel`
   *     as properties will be passed as the second argument. `error` will be
   *     the object created by `errorInstance` or `errorConstructor`, regardless
   *     of whether or not an exception is being thrown.
   * @param {"DEBUG"|"ERROR"|"INFO"|"OFF"|"WARN"} [options.logLevel]
   *     When logging a message and `options.logFunction` is not provided, then
   *     this will be used to determine the appropriate log4js method that will
   *     be used to log the message. Valid options include all log constants
   *     that are available on a `Config` object constructed by Karma. The
   *     default value for this option depends upon what was passed to the
   *     factory. If the factory does not configure it, then the default value
   *     will be `"INFO"`.
   */
  function logMessage (messageArgs, options) {
    const _options = typeof options === 'object' && options !== null ? options : {}
    const action = validActions.includes(_options.action)
      ? _options.action
      : DEFAULT_ACTION
    const exitCode = _options.exitCode || 1
    const logLevel = validLogLevels.includes(_options.logLevel)
      ? _options.logLevel
      : DEFAULT_LEVEL
    const { errorConstructor, errorInstance, logFunction } = _options
    const _messageArgs = Array.isArray(messageArgs) ? messageArgs : [messageArgs]
    const [message, ...otherMessageArgs] = _messageArgs

    let error = null
    if (typeof errorInstance === 'object' && errorInstance !== null) {
      // Copy the original to avoid mutating by reference. We are especially
      // interested in the name, message, and stack.
      const ErrorConstructor = Object.getPrototypeOf(errorInstance).constructor
      const newError = Object.create(ErrorConstructor)

      // Copy all own enumerable, non-enumerable, and Symbol key properties.
      // Don't copy the descriptors directly, just in case it references
      // something not exposed by the object.
      const instanceDescriptors = Object.getOwnPropertyDescriptors(errorInstance)
      for (const propName of Object.keys(instanceDescriptors)) {
        newError[propName] = errorInstance[propName]
      }
      if (newError.message !== message) {
        newError.originalMessage = newError.message
        newError.message = message
      }
      error = newError
    } else if (typeof errorConstructor === 'function') {
      const ErrorConstructor = errorConstructor
      error = new ErrorConstructor(message)
    } else {
      error = new Error(message)
    }

    const shouldThrow = CAN_THROW && action === ACTION_THROW
    if (shouldThrow) {
      throw error
      // TODO: Should the `log4js` function always be called? Do appenders emit
      //     : messages to other systems that care about messages?
    }

    // const shouldLog = action === ACTION_LOG || action === ACTION_LOG_AND_EXIT
    // if (shouldLog) {
    if (typeof logFunction === 'function') {
      logFunction(message, { action, error, logLevel })
      // TODO: Should the `log4js` function always be called? Do appenders emit
      //     : messages to other systems that care about messages?
    } else {
      const levelMethodName = getLevelMethodName(logLevel)
      categoryLogger[levelMethodName](message, ...otherMessageArgs)
    }
    // }

    const shouldExit = CAN_EXIT && action === ACTION_LOG_AND_EXIT
    if (shouldExit) {
      process.exit(exitCode)
    }
  }
  return logMessage
}

module.exports = exports = { logActions: actions, logMessageFactory }
