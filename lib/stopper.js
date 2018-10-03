const http = require('http')

const cfg = require('./config')
const logger = require('./logger')
const helper = require('./helper')

exports.stop = function (config, done) {
  config = config || {}
  logger.setupFromConfig(config)
  done = helper.isFunction(done) ? done : process.exit
  const log = logger.create('stopper')
  config = cfg.parseConfig(config.configFile, config)

  const options = {
    hostname: config.hostname,
    path: config.urlRoot + 'stop',
    port: config.port,
    method: 'GET'
  }

  const request = http.request(options)

  request.on('response', function (response) {
    if (response.statusCode !== 200) {
      log.error('Server returned status code: ' + response.statusCode)
      done(1)
      return
    }

    log.info('Server stopped.')
    done(0)
  })

  request.on('error', function (e) {
    if (e.code === 'ECONNREFUSED') {
      log.error('There is no server listening on port %d', options.port)
      done(1, e.code)
    } else {
      throw e
    }
  })
  request.end()
}
