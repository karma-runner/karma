'use strict'

const http = require('http')

const constant = require('./constants')
const EventEmitter = require('events').EventEmitter
const helper = require('./helper')
const cfg = require('./config')
const logger = require('./logger')
const log = logger.create('runner')

function parseExitCode (buffer, defaultExitCode, failOnEmptyTestSuite) {
  const tailPos = buffer.length - Buffer.byteLength(constant.EXIT_CODE) - 2

  if (tailPos < 0) {
    return { exitCode: defaultExitCode, buffer }
  }

  const tail = buffer.slice(tailPos)
  const tailStr = tail.toString()
  if (tailStr.slice(0, -2) === constant.EXIT_CODE) {
    const emptyInt = parseInt(tailStr.slice(-2, -1), 10)
    let exitCode = parseInt(tailStr.slice(-1), 10)
    if (failOnEmptyTestSuite === false && emptyInt === 0) {
      log.warn('Test suite was empty.')
      exitCode = 0
    }
    return { exitCode, buffer: buffer.slice(0, tailPos) }
  }

  return { exitCode: defaultExitCode, buffer }
}

// TODO(vojta): read config file (port, host, urlRoot)
function run (cliOptionsOrConfig, done) {
  cliOptionsOrConfig = cliOptionsOrConfig || {}
  done = helper.isFunction(done) ? done : process.exit

  let config
  if (cliOptionsOrConfig instanceof cfg.Config) {
    config = cliOptionsOrConfig
  } else {
    logger.setupFromConfig({
      colors: cliOptionsOrConfig.colors,
      logLevel: cliOptionsOrConfig.logLevel
    })
    const deprecatedCliOptionsMessage =
      'Passing raw CLI options to `runner(config, done)` is deprecated. Use ' +
      '`parseConfig(configFilePath, cliOptions, {promiseConfig: true, throwErrors: true})` ' +
      'to prepare a processed `Config` instance and pass that as the ' +
      '`config` argument instead.'
    log.warn(deprecatedCliOptionsMessage)
    try {
      config = cfg.parseConfig(
        cliOptionsOrConfig.configFile,
        cliOptionsOrConfig,
        {
          promiseConfig: false,
          throwErrors: true
        }
      )
    } catch (parseConfigError) {
      // TODO: change how `done` falls back to exit in next major version
      //  SEE: https://github.com/karma-runner/karma/pull/3635#discussion_r565399378
      done(1)
    }
  }
  let exitCode = 1
  const emitter = new EventEmitter()
  const options = {
    hostname: config.hostname,
    path: config.urlRoot + 'run',
    port: config.port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const request = http.request(options, function (response) {
    response.on('data', function (buffer) {
      const parsedResult = parseExitCode(buffer, exitCode, config.failOnEmptyTestSuite)
      exitCode = parsedResult.exitCode
      emitter.emit('progress', parsedResult.buffer)
    })

    response.on('end', () => done(exitCode))
  })

  request.on('error', function (e) {
    if (e.code === 'ECONNREFUSED') {
      log.error('There is no server listening on port %d', options.port)
      done(1, e.code)
    } else {
      throw e
    }
  })

  request.end(JSON.stringify({
    args: config.clientArgs,
    removedFiles: config.removedFiles,
    changedFiles: config.changedFiles,
    addedFiles: config.addedFiles,
    refresh: config.refresh,
    colors: config.colors
  }))

  return emitter
}

exports.run = run
