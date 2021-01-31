'use strict'

const path = require('path')
const yargs = require('yargs')
const fs = require('graceful-fs')

const Server = require('./server')
const helper = require('./helper')
const constant = require('./constants')

function processArgs (argv, options, fs, path) {
  Object.getOwnPropertyNames(argv).forEach(function (name) {
    let argumentValue = argv[name]
    if (name !== '_' && name !== '$0') {
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

  let configFile = argv.configFile

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

  if (options.cmd === 'run') {
    options.clientArgs = parseClientArgs(process.argv)
  }

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

function describeRoot () {
  return yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'Run --help with particular command to see its description and available options.\n\n' +
      'Usage:\n' +
      '  $0 <command>')
    .command('init [configFile]', 'Initialize a config file.', describeInit)
    .command('start [configFile]', 'Start the server / do a single run.', describeStart)
    .command('run [configFile]', 'Trigger a test run.', describeRun)
    .command('stop [configFile]', 'Stop the server.', describeStop)
    .command('completion', 'Shell completion for karma.', describeCompletion)
    .demandCommand(1, 'Command not specified.')
    .strictCommands()
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.')
}

function describeInit (yargs) {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'INIT - Initialize a config file.\n\n' +
      'Usage:\n' +
      '  $0 init [configFile]')
    .strictCommands(false)
    .version(false)
    .positional('configFile', {
      describe: 'Name of the generated Karma configuration file',
      type: 'string'
    })
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
}

function describeStart (yargs) {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'START - Start the server / do a single run.\n\n' +
      'Usage:\n' +
      '  $0 start [configFile]')
    .strictCommands(false)
    .version(false)
    .positional('configFile', {
      describe: 'Path to the Karma configuration file',
      type: 'string'
    })
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
    .option('format-error', {
      describe: 'A path to a file that exports the format function.',
      type: 'string'
    })
}

function describeRun (yargs) {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'RUN - Run the tests (requires running server).\n\n' +
      'Usage:\n' +
      '  $0 run [configFile] [-- <clientArgs>]')
    .strictCommands(false)
    .version(false)
    .positional('configFile', {
      describe: 'Path to the Karma configuration file',
      type: 'string'
    })
    .describe('port', '<integer> Port where the server is listening.')
    .describe('no-refresh', 'Do not re-glob all the patterns.')
    .describe('fail-on-empty-test-suite', 'Fail on empty test suite.')
    .describe('no-fail-on-empty-test-suite', 'Do not fail on empty test suite.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .option('removed-files', {
      describe: 'Comma-separated paths to removed files. Useful when automatic file watching is disabled.',
      type: 'string'
    })
    .option('changed-files', {
      describe: 'Comma-separated paths to changed files. Useful when automatic file watching is disabled.',
      type: 'string'
    })
    .option('added-files', {
      describe: 'Comma-separated paths to added files. Useful when automatic file watching is disabled.',
      type: 'string'
    })
}

function describeStop (yargs) {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'STOP - Stop the server (requires running server).\n\n' +
      'Usage:\n' +
      '  $0 stop [configFile]')
    .strictCommands(false)
    .version(false)
    .positional('configFile', {
      describe: 'Path to the Karma configuration file',
      type: 'string'
    })
    .describe('port', '<integer> Port where the server is listening.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
}

function describeCompletion (yargs) {
  yargs
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'COMPLETION - Bash/ZSH completion for karma.\n\n' +
      'Installation:\n' +
      '  $0 completion >> ~/.bashrc')
    .version(false)
}

function printRunnerProgress (data) {
  process.stdout.write(data)
}

exports.process = () => {
  const argv = describeRoot().parse(argsBeforeDoubleDash(process.argv.slice(2)))
  return processArgs(argv, { cmd: argv._.shift() }, fs, path)
}

exports.run = () => {
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
