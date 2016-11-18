/**
 * Stopper middleware is responsible for communicating with `karma stop`.
 */

var log = require('../logger').create('middleware:stopper')

export function create(urlRoot) {
  return function (request, response, next) {
    if (request.url !== urlRoot + 'stop') return next()
    response.writeHead(200)
    log.info('Stopping server')
    response.end('OK')
    process.kill(process.pid, 'SIGINT')
  }
}

create.$inject = ['config.urlRoot']
