'use strict'

const querystring = require('querystring')
const common = require('./common')

const log = require('../logger').create('middleware:source-files')

function findByPath (files, path) {
  return Array.from(files).find((file) => file.path === path)
}

function composeUrl (url, basePath, urlRoot) {
  return url
    .replace(urlRoot, '/')
    .replace(/\?.*$/, '')
    .replace(/^\/absolute/, '')
    .replace(/^\/base/, basePath)
}

// Source Files middleware is responsible for serving all the source files under the test.
function createSourceFilesMiddleware (filesPromise, serveFile, basePath, urlRoot) {
  return function (request, response, next) {
    const requestedFilePath = composeUrl(request.url, basePath, urlRoot)
    // When a path contains HTML-encoded characters (e.g %2F used by Jenkins for branches with /)
    const requestedFilePathUnescaped = composeUrl(querystring.unescape(request.url), basePath, urlRoot)

    request.pause()

    log.debug('Requesting %s', request.url, urlRoot)
    log.debug('Fetching %s', requestedFilePath)

    return filesPromise.then(function (files) {
      // TODO(vojta): change served to be a map rather then an array
      const file = findByPath(files.served, requestedFilePath) || findByPath(files.served, requestedFilePathUnescaped)
      const rangeHeader = request.headers['range']

      if (file) {
        serveFile(file.contentPath || file.path, rangeHeader, response, function () {
          if (/\?\w+/.test(request.url)) {
            common.setHeavyCacheHeaders(response) // files with timestamps - cache one year, rely on timestamps
          } else {
            common.setNoCacheHeaders(response) // without timestamps - no cache (debug)
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

exports.create = createSourceFilesMiddleware
