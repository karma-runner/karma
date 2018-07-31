'use strict'

const readline = require('readline')
const path = require('path')
const glob = require('glob')
const mm = require('minimatch')
const exec = require('child_process').exec

const helper = require('./helper')
const logger = require('./logger')

const log = logger.create('init')
const logQueue = require('./init/log-queue')

const StateMachine = require('./init/state_machine')
const COLOR_SCHEME = require('./init/color_schemes')
const formatters = require('./init/formatters')

// TODO(vojta): coverage
// TODO(vojta): html preprocessors
// TODO(vojta): SauceLabs
// TODO(vojta): BrowserStack

var NODE_MODULES_DIR = path.resolve(__dirname, '../..')

// Karma is not in node_modules, probably a symlink,
// use current working dir.
if (!/node_modules$/.test(NODE_MODULES_DIR)) {
  NODE_MODULES_DIR = path.resolve('node_modules')
}

function installPackage (pkgName) {
  // Do not install if already installed.
  try {
    require(NODE_MODULES_DIR + '/' + pkgName)
    return
  } catch (e) {}

  log.debug('Missing plugin "%s". Installing...', pkgName)

  const options = {
    cwd: path.resolve(NODE_MODULES_DIR, '..')
  }

  exec('npm install ' + pkgName + ' --save-dev', options, function (err, stdout, stderr) {
    // Put the logs into the queue and print them after answering current question.
    // Otherwise the log would clobber the interactive terminal.
    logQueue.push(function () {
      if (!err) {
        log.debug('%s successfully installed.', pkgName)
      } else if (/is not in the npm registry/.test(stderr)) {
        log.warn('Failed to install "%s". It is not in the NPM registry!\n' +
          '  Please install it manually.', pkgName)
      } else if (/Error: EACCES/.test(stderr)) {
        log.warn('Failed to install "%s". No permissions to write in %s!\n' +
          '  Please install it manually.', pkgName, options.cwd)
      } else {
        log.warn('Failed to install "%s"\n  Please install it manually.', pkgName)
      }
    })
  })
}

function validatePattern (pattern) {
  if (!glob.sync(pattern).length) {
    log.warn('There is no file matching this pattern.\n')
  }
}

function validateBrowser (name) {
  // TODO(vojta): check if the path resolves to a binary
  installPackage('karma-' + name.toLowerCase().replace('canary', '') + '-launcher')
}

function validateFramework (name) {
  installPackage('karma-' + name)
}

function validateRequireJs (useRequire) {
  if (useRequire) {
    validateFramework('requirejs')
  }
}

var questions = [{
  id: 'framework',
  question: 'Which testing framework do you want to use ?',
  hint: 'Press tab to list possible options. Enter to move to the next question.',
  options: ['jasmine', 'mocha', 'qunit', 'nodeunit', 'nunit', ''],
  validate: validateFramework
}, {
  id: 'requirejs',
  question: 'Do you want to use Require.js ?',
  hint: 'This will add Require.js plugin.\n' +
    'Press tab to list possible options. Enter to move to the next question.',
  options: ['no', 'yes'],
  validate: validateRequireJs,
  boolean: true
}, {
  id: 'browsers',
  question: 'Do you want to capture any browsers automatically ?',
  hint: 'Press tab to list possible options. Enter empty string to move to the next question.',
  options: ['Chrome', 'ChromeHeadless', 'ChromeCanary', 'Firefox', 'Safari', 'PhantomJS', 'Opera', 'IE', ''],
  validate: validateBrowser,
  multiple: true
}, {
  id: 'files',
  question: 'What is the location of your source and test files ?',
  hint: 'You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern
}, {
  id: 'exclude',
  question: 'Should any of the files included by the previous patterns be excluded ?',
  hint: 'You can use glob patterns, eg. "**/*.swp".\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern
}, {
  id: 'generateTestMain',
  question: 'Do you wanna generate a bootstrap file for RequireJS?',
  hint: 'This will generate test-main.js/coffee that configures RequireJS and starts the tests.',
  options: ['no', 'yes'],
  boolean: true,
  condition: (answers) => answers.requirejs
}, {
  id: 'includedFiles',
  question: 'Which files do you want to include with <script> tag ?',
  hint: 'This should be a script that bootstraps your test by configuring Require.js and ' +
    'kicking __karma__.start(), probably your test-main.js file.\n' +
    'Enter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: (answers) => answers.requirejs && !answers.generateTestMain
}, {
  id: 'autoWatch',
  question: 'Do you want Karma to watch all the files and run the tests on change ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}]

function getBasePath (configFilePath, cwd) {
  const configParts = path.dirname(configFilePath).split(path.sep)
  const cwdParts = cwd.split(path.sep)
  const base = []

  while (configParts.length && configParts[0] === cwdParts[0]) {
    configParts.shift()
    cwdParts.shift()
  }

  while (configParts.length) {
    const part = configParts.shift()
    if (part === '..') {
      base.unshift(cwdParts.pop())
    } else if (part !== '.') {
      base.unshift('..')
    }
  }

  return base.join(path.sep)
}

function processAnswers (answers, basePath, testMainFile) {
  const processedAnswers = {
    basePath: basePath,
    files: answers.files,
    onlyServedFiles: [],
    exclude: answers.exclude,
    autoWatch: answers.autoWatch,
    generateTestMain: answers.generateTestMain,
    browsers: answers.browsers,
    frameworks: [],
    preprocessors: {}
  }

  if (answers.framework) {
    processedAnswers.frameworks.push(answers.framework)
  }

  if (answers.requirejs) {
    processedAnswers.frameworks.push('requirejs')
    processedAnswers.files = answers.includedFiles || []
    processedAnswers.onlyServedFiles = answers.files

    if (answers.generateTestMain) {
      processedAnswers.files.push(testMainFile)
    }
  }

  const allPatterns = answers.files.concat(answers.includedFiles || [])
  if (allPatterns.some((pattern) => mm(pattern, '**/*.coffee'))) {
    installPackage('karma-coffee-preprocessor')
    processedAnswers.preprocessors['**/*.coffee'] = ['coffee']
  }

  return processedAnswers
}

exports.init = function (config) {
  logger.setupFromConfig(config)

  const colorScheme = !helper.isDefined(config.colors) || config.colors ? COLOR_SCHEME.ON : COLOR_SCHEME.OFF
  // need to be registered before creating readlineInterface
  process.stdin.on('keypress', function (s, key) {
    sm.onKeypress(key)
  })

  const rli = readline.createInterface(process.stdin, process.stdout)
  const sm = new StateMachine(rli, colorScheme)

  rli.on('line', sm.onLine.bind(sm))

  // clean colors
  rli.on('SIGINT', function () {
    sm.kill()
    process.exit(0)
  })

  sm.process(questions, function (answers) {
    const cwd = process.cwd()
    const configFile = config.configFile || 'karma.conf.js'
    const isCoffee = path.extname(configFile) === '.coffee'
    const testMainFile = isCoffee ? 'test-main.coffee' : 'test-main.js'
    const formatter = formatters.createForPath(configFile)
    const processedAnswers = processAnswers(answers, getBasePath(configFile, cwd), testMainFile)
    const configFilePath = path.resolve(cwd, configFile)
    const testMainFilePath = path.resolve(cwd, testMainFile)

    if (isCoffee) {
      installPackage('coffee-script')
    }

    if (processedAnswers.generateTestMain) {
      formatter.writeRequirejsConfigFile(testMainFilePath)
      console.log(colorScheme.success(
        'RequireJS bootstrap file generated at "' + testMainFilePath + '".\n'
      ))
    }

    formatter.writeConfigFile(configFilePath, processedAnswers)
    console.log(colorScheme.success('Config file generated at "' + configFilePath + '".\n'))
  })
}
