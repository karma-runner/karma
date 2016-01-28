var http = require('http')

var cfg = require('./config')
var logger = require('./logger')

exports.stop = function (config) {
  logger.setupFromConfig(config)
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
    log.info('Server stopped.')
    process.exit(response.statusCode === 200 ? 0 : 1)
  })

  request.on('error', function (e) {
    if (e.code === 'ECONNREFUSED') {
      log.error('There is no server listening on port %d', options.port)
      process.exit(1, e.code)
    } else {
      throw e
    }
  })
  request.end()
}
