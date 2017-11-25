var querystring = require('querystring')
var _ = require('lodash')

var common = require('./common')
var logger = require('../logger')
var log = logger.create('middleware:source-files')

// Files is a Set
var findByPath = function (files, path) {
  return _.find(Array.from(files), function (file) {
    return file.path === path
  })
}

var composeUrl = function (url, basePath, urlRoot, mustEscape) {
  return (mustEscape ? querystring.unescape(url) : url)
    .replace(urlRoot, '/')
    .replace(/\?.*$/, '')
    .replace(/^\/absolute/, '')
    .replace(/^\/base/, basePath)
}

// Source Files middleware is responsible for serving all the source files under the test.
var createSourceFilesMiddleware = function (filesPromise, serveFile, basePath, urlRoot) {
  return function (request, response, next) {
    var requestedFilePath = composeUrl(request.url, basePath, urlRoot, true)
    // When a path contains HTML-encoded characters (e.g %2F used by Jenkins for branches with /)
    var requestedFilePathUnescaped = composeUrl(request.url, basePath, urlRoot, false)

    request.pause()

    log.debug('Requesting %s', request.url, urlRoot)
    log.debug('Fetching %s', requestedFilePath)

    return filesPromise.then(function (files) {
      // TODO(vojta): change served to be a map rather then an array
      var file = findByPath(files.served, requestedFilePath) ||
                 findByPath(files.served, requestedFilePathUnescaped)
      var rangeHeader = request.headers['range']

      if (file) {
        serveFile(file.contentPath || file.path, rangeHeader, response, function () {
          if (/\?\w+/.test(request.url)) {
            // files with timestamps - cache one year, rely on timestamps
            common.setHeavyCacheHeaders(response)
          } else {
            // without timestamps - no cache (debug)
            common.setNoCacheHeaders(response)
          }
        }, file.content, file.doNotCache)
      } else {
        next()
      }

      request.resume()
    })
  }
}

createSourceFilesMiddleware.$inject = [
  'filesPromise', 'serveFile', 'config.basePath', 'config.urlRoot'
]

// PUBLIC API
exports.create = createSourceFilesMiddleware
