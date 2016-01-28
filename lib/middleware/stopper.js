/**
 * Stopper middleware is responsible for communicating with `karma stop`.
 */

var log = require('../logger').create('middleware:stopper')

var createStopperMiddleware = function (urlRoot) {
  return function (request, response, next) {
    if (request.url !== urlRoot + 'stop') return next()
    response.writeHead(200)
    log.info('Stopping server')
    response.end('OK')
    process.exit(0)
  }
}

createStopperMiddleware.$inject = ['config.urlRoot']
exports.create = createStopperMiddleware
