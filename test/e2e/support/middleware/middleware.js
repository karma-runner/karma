function middleware (request, response, next) {
  if (/\/foo\.js/.test(request.normalizedUrl)) {
    response.setHeader('Content-Type', 'text/plain')
    response.writeHead(200)
    response.end('this is the middleware response')
    return
  }
  next()
}

function framework (config) {
  config.middleware = config.middleware || []
  config.middleware.push('foo')
}

framework.$inject = ['config']

module.exports = {
  'framework:foo': ['factory', framework],
  'middleware:foo': ['value', middleware]
}
