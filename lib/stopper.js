const http = require('http')
const cfg = require('./config')
const logger = require('./logger')
const helper = require('./helper')

exports.stop = function (config, done) {
  config = config || {}
  logger.setupFromConfig(config)
  const log = logger.create('stopper')
  done = helper.isFunction(done) ? done : process.exit
  config = cfg.parseConfig(config.configFile, config)

  const request = http.request({
    hostname: config.hostname,
    path: config.urlRoot + 'stop',
    port: config.port,
    method: 'GET'
  })

  request.on('response', function (response) {
    if (response.statusCode === 200) {
      log.info('Server stopped.')
      done(0)
    } else {
      log.error(`Server returned status code: ${response.statusCode}`)
      done(1)
    }
  })

  request.on('error', function (e) {
    if (e.code === 'ECONNREFUSED') {
      log.error(`There is no server listening on port ${config.port}`)
      done(1, e.code)
    } else {
      throw e
    }
  })
  request.end()
}
