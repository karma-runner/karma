'use strict'

const path = require('path')
const assert = require('assert')
const yargs = require('yargs')
const fs = require('graceful-fs')

const Server = require('./server')
const helper = require('./helper')
const constant = require('./constants')

function processArgs (argv, options, fs, path) {
  if (argv.help) {
    console.log(yargs.help())
    process.exit(0)
  }

  if (argv.version) {
    console.log(`Karma version: ${constant.VERSION}`)
    process.exit(0)
  }

  // TODO(vojta): warn/throw when unknown argument (probably mispelled)
  Object.getOwnPropertyNames(argv).forEach(function (name) {
    let argumentValue = argv[name]
    if (name !== '_' && name !== '$0') {
      assert(!name.includes('_'), `Bad argument: ${name} did you mean ${name.replace('_', '-')}`)

      if (Array.isArray(argumentValue)) {
        argumentValue = argumentValue.pop() // If the same argument is defined multiple times, override.
      }
      options[helper.dashToCamel(name)] = argumentValue
    }
  })

  if (helper.isString(options.autoWatch)) {
    options.autoWatch = options.autoWatch === 'true'
  }

  if (helper.isString(options.colors)) {
    options.colors = options.colors === 'true'
  }

  if (helper.isString(options.failOnEmptyTestSuite)) {
    options.failOnEmptyTestSuite = options.failOnEmptyTestSuite === 'true'
  }

  if (helper.isString(options.failOnFailingTestSuite)) {
    options.failOnFailingTestSuite = options.failOnFailingTestSuite === 'true'
  }

  if (helper.isString(options.formatError)) {
    let required
    try {
      required = require(options.formatError)
    } catch (err) {
      console.error('Could not require formatError: ' + options.formatError, err)
    }
    // support exports.formatError and module.exports = function
    options.formatError = required.formatError || required
    if (!helper.isFunction(options.formatError)) {
      console.error(`Format error must be a function, got: ${typeof options.formatError}`)
      process.exit(1)
    }
  }

  if (helper.isString(options.logLevel)) {
    const logConstant = constant['LOG_' + options.logLevel.toUpperCase()]
    if (helper.isDefined(logConstant)) {
      options.logLevel = logConstant
    } else {
      console.error('Log level must be one of disable, error, warn, info, or debug.')
      process.exit(1)
    }
  } else if (helper.isDefined(options.logLevel)) {
    console.error('Log level must be one of disable, error, warn, info, or debug.')
    process.exit(1)
  }

  if (helper.isString(options.singleRun)) {
    options.singleRun = options.singleRun === 'true'
  }

  if (helper.isString(options.browsers)) {
    options.browsers = options.browsers.split(',')
  }

  if (options.reportSlowerThan === false) {
    options.reportSlowerThan = 0
  }

  if (helper.isString(options.reporters)) {
    options.reporters = options.reporters.split(',')
  }

  if (helper.isString(options.removedFiles)) {
    options.removedFiles = options.removedFiles.split(',')
  }

  if (helper.isString(options.addedFiles)) {
    options.addedFiles = options.addedFiles.split(',')
  }

  if (helper.isString(options.changedFiles)) {
    options.changedFiles = options.changedFiles.split(',')
  }

  if (helper.isString(options.refresh)) {
    options.refresh = options.refresh === 'true'
  }

  let configFile = argv._.shift()

  if (!configFile) {
    // default config file (if exists)
    if (fs.existsSync('./karma.conf.js')) {
      configFile = './karma.conf.js'
    } else if (fs.existsSync('./karma.conf.coffee')) {
      configFile = './karma.conf.coffee'
    } else if (fs.existsSync('./karma.conf.ts')) {
      configFile = './karma.conf.ts'
    } else if (fs.existsSync('./.config/karma.conf.js')) {
      configFile = './.config/karma.conf.js'
    } else if (fs.existsSync('./.config/karma.conf.coffee')) {
      configFile = './.config/karma.conf.coffee'
    } else if (fs.existsSync('./.config/karma.conf.ts')) {
      configFile = './.config/karma.conf.ts'
    }
  }

  options.configFile = configFile ? path.resolve(configFile) : null

  return options
}

function parseClientArgs (argv) {
  // extract any args after '--' as clientArgs
  let clientArgs = []
  argv = argv.slice(2)
  const idx = argv.indexOf('--')
  if (idx !== -1) {
    clientArgs = argv.slice(idx + 1)
  }
  return clientArgs
}

// return only args that occur before `--`
function argsBeforeDoubleDash (argv) {
  const idx = argv.indexOf('--')

  return idx === -1 ? argv : argv.slice(0, idx)
}

function describeShared () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'Usage:\n' +
      '  $0 <command>\n\n' +
      'Commands:\n' +
      '  start [<configFile>] [<options>] Start the server / do single run.\n' +
      '  init [<configFile>] Initialize a config file.\n' +
      '  run [<options>] [ -- <clientArgs>] Trigger a test run.\n' +
      '  completion Shell completion for karma.\n\n' +
      'Run --help with particular command to see its description and available options.')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.')
}

function describeInit () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'INIT - Initialize a config file.\n\n' +
      'Usage:\n' +
      '  $0 init [<configFile>]')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('help', 'Print usage and options.')
}

function describeStart () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'START - Start the server / do a single run.\n\n' +
      'Usage:\n' +
      '  $0 start [<configFile>] [<options>]')
    .describe('port', '<integer> Port where the server is running.')
    .describe('auto-watch', 'Auto watch source files and run on change.')
    .describe('detached', 'Detach the server.')
    .describe('no-auto-watch', 'Do not watch source files.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('reporters', 'List of reporters (available: dots, progress, junit, growl, coverage).')
    .describe('browsers', 'List of browsers to start (eg. --browsers Chrome,ChromeCanary,Firefox).')
    .describe('capture-timeout', '<integer> Kill browser if does not capture in given time [ms].')
    .describe('single-run', 'Run the test when browsers captured and exit.')
    .describe('no-single-run', 'Disable single-run.')
    .describe('report-slower-than', '<integer> Report tests that are slower than given time [ms].')
    .describe('fail-on-empty-test-suite', 'Fail on empty test suite.')
    .describe('no-fail-on-empty-test-suite', 'Do not fail on empty test suite.')
    .describe('fail-on-failing-test-suite', 'Fail on failing test suite.')
    .describe('no-fail-on-failing-test-suite', 'Do not fail on failing test suite.')
    .describe('help', 'Print usage and options.')
}

function describeRun () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'RUN - Run the tests (requires running server).\n\n' +
      'Usage:\n' +
      '  $0 run [<configFile>] [<options>] [ -- <clientArgs>]')
    .describe('port', '<integer> Port where the server is listening.')
    .describe('no-refresh', 'Do not re-glob all the patterns.')
    .describe('fail-on-empty-test-suite', 'Fail on empty test suite.')
    .describe('no-fail-on-empty-test-suite', 'Do not fail on empty test suite.')
    .describe('help', 'Print usage.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
}

function describeStop () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'STOP - Stop the server (requires running server).\n\n' +
      'Usage:\n' +
      '  $0 run [<configFile>] [<options>]')
    .describe('port', '<integer> Port where the server is listening.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('help', 'Print usage.')
}

function describeCompletion () {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'COMPLETION - Bash/ZSH completion for karma.\n\n' +
      'Installation:\n' +
      '  $0 completion >> ~/.bashrc\n')
    .describe('help', 'Print usage.')
}

function printRunnerProgress (data) {
  process.stdout.write(data)
}

exports.process = function () {
  const argv = yargs.parse(argsBeforeDoubleDash(process.argv.slice(2)))
  const options = {
    cmd: argv._.shift()
  }

  switch (options.cmd) {
    case 'start':
      describeStart()
      break

    case 'run':
      describeRun()
      options.clientArgs = parseClientArgs(process.argv)
      break

    case 'stop':
      describeStop()
      break

    case 'init':
      describeInit()
      break

    case 'completion':
      describeCompletion()
      break

    default:
      describeShared()
      if (!options.cmd) {
        processArgs(argv, options, fs, path)
        console.error('Command not specified.')
      } else {
        console.error('Unknown command "' + options.cmd + '".')
      }
      yargs.showHelp()
      process.exit(1)
  }

  return processArgs(argv, options, fs, path)
}

exports.run = function () {
  const config = exports.process()

  switch (config.cmd) {
    case 'start':
      new Server(config).start()
      break
    case 'run':
      require('./runner')
        .run(config)
        .on('progress', printRunnerProgress)
      break
    case 'stop':
      require('./stopper').stop(config)
      break
    case 'init':
      require('./init').init(config)
      break
    case 'completion':
      require('./completion').completion(config)
      break
  }
}

// just for testing
exports.processArgs = processArgs
exports.parseClientArgs = parseClientArgs
exports.argsBeforeDoubleDash = argsBeforeDoubleDash
