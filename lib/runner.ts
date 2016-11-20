import http = require('http')

import constant = require('./constants')
import helper = require('./helper')
import cfg = require('./config')
import {create, setupFromConfig} from './logger'
var log = create('runner')

function parseExitCode(buffer, defaultCode, failOnEmptyTestSuite) {
  var tailPos = buffer.length - Buffer.byteLength(constant.EXIT_CODE) - 2

  if (tailPos < 0) {
    return {exitCode: defaultCode, buffer: buffer}
  }

  // tail buffer which might contain the message
  var tail = buffer.slice(tailPos)
  var tailStr = tail.toString()
  if (tailStr.substr(0, tailStr.length - 2) === constant.EXIT_CODE) {
    var emptyInt = parseInt(tailStr.substr(-2, 1), 10)
    var exitCode = parseInt(tailStr.substr(-1), 10)
    if (failOnEmptyTestSuite === false && emptyInt === 0) {
      log.warn('Test suite was empty.')
      exitCode = 0
    }
    return {exitCode: exitCode, buffer: buffer.slice(0, tailPos)}
  }

  return {exitCode: defaultCode, buffer: buffer}
}

// TODO(vojta): read config file (port, host, urlRoot)
export function run(config: any = {}, done) {

  setupFromConfig(config)

  done = helper.isFunction(done) ? done : process.exit
  config = cfg.parseConfig(config.configFile, config)

  var exitCode = 1
  var options = {
    hostname: config.hostname,
    path: config.urlRoot + 'run',
    port: config.port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  var request = http.request(options, response => {
    response.on('data', buffer => {
      var parsedResult = parseExitCode(buffer, exitCode, config.failOnEmptyTestSuite)
      exitCode = parsedResult.exitCode
      process.stdout.write(parsedResult.buffer)
    })

    response.on('end', () => done(exitCode))
  })

  request.on('error', (e: any)=> {
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
}
