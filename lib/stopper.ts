import http = require('http')

import cfg = require('./config')
import logger = require('./logger')
import helper = require('./helper')

export function stop(config, done?) {
  config = config || {}
  logger.setupFromConfig(config)
  done = helper.isFunction(done) ? done : process.exit
  var log = logger.create('stopper')
  config = cfg.parseConfig(config.configFile, config)

  var options = {
    hostname: config.hostname,
    path: config.urlRoot + 'stop',
    port: config.port,
    method: 'GET'
  }

  var request = http.request(options)

  request.on('response', function (response) {
    if (response.statusCode !== 200) {
      log.error('Server returned status code: ' + response.statusCode)
      done(1)
      return
    }

    log.info('Server stopped.')
    done(0)
  })

  request.on('error', function (e: any) {
    if (e.code === 'ECONNREFUSED') {
      log.error('There is no server listening on port %d', options.port)
      done(1, e.code)
    } else {
      throw e
    }
  })
  request.end()
}
