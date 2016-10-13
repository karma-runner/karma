/**
 * This module contains some common helpers shared between middlewares
 */

var mime = require('mime')
var _ = require('lodash')
var parseRange = require('range-parser')

var log = require('../logger').create('web-server')

var PromiseContainer = function () {
  var promise

  this.then = function (success, error) {
    error = error || _.noop
    return promise.then(success).catch(error)
  }

  this.set = function (newPromise) {
    promise = newPromise
  }
}

var serve404 = function (response, path) {
  log.warn('404: ' + path)
  response.writeHead(404)
  return response.end('NOT FOUND')
}

var createServeFile = function (fs, directory, config) {
  var cache = Object.create(null)

  return function (filepath, rangeHeader, response, transform, content, doNotCache) {
    var responseData

    var convertForRangeRequest = function () {
      var range = parseRange(responseData.length, rangeHeader)
      if (range === -2) {
        // malformed header string
        return 200
      } else if (range === -1) {
        // unsatisfiable range
        responseData = new Buffer(0)
        return 416
      } else if (range.type === 'bytes') {
        responseData = new Buffer(responseData)
        if (range.length === 1) {
          var start = range[0].start
          var end = range[0].end
          response.setHeader(
            'Content-Range',
            'bytes ' + start + '-' + end + '/' + responseData.length
          )
          response.setHeader('Accept-Ranges', 'bytes')
          response.setHeader('Content-Length', end - start + 1)
          responseData = responseData.slice(start, end + 1)
          return 206
        } else {
          // Multiple ranges are not supported. Maybe future?
          responseData = new Buffer(0)
          return 416
        }
      }
      // All other states, ignore
      return 200
    }

    if (directory) {
      filepath = directory + filepath
    }

    if (!content && cache[filepath]) {
      content = cache[filepath]
    }

    if (config && config.customHeaders && config.customHeaders.length > 0) {
      config.customHeaders.forEach(function (header) {
        var regex = new RegExp(header.match)
        if (regex.test(filepath)) {
          log.debug('setting header: ' + header.name + ' for: ' + filepath)
          response.setHeader(header.name, header.value)
        }
      })
    }

    // serve from cache
    if (content && !doNotCache) {
      response.setHeader('Content-Type', mime.lookup(filepath, 'text/plain'))

      // call custom transform fn to transform the data
      responseData = transform && transform(content) || content

      if (rangeHeader) {
        var code = convertForRangeRequest()
        response.writeHead(code)
      } else {
        response.writeHead(200)
      }

      log.debug('serving (cached): ' + filepath)
      return response.end(responseData)
    }

    return fs.readFile(filepath, function (error, data) {
      if (error) {
        return serve404(response, filepath)
      }

      if (!doNotCache) {
        cache[filepath] = data.toString()
      }

      response.setHeader('Content-Type', mime.lookup(filepath, 'text/plain'))

      // call custom transform fn to transform the data
      responseData = transform && transform(data.toString()) || data

      if (rangeHeader) {
        var code = convertForRangeRequest()
        response.writeHead(code)
      } else {
        response.writeHead(200)
      }

      log.debug('serving: ' + filepath)
      return response.end(responseData)
    })
  }
}

var setNoCacheHeaders = function (response) {
  response.setHeader('Cache-Control', 'no-cache')
  response.setHeader('Pragma', 'no-cache')
  response.setHeader('Expires', (new Date(0)).toUTCString())
}

var setHeavyCacheHeaders = function (response) {
  response.setHeader('Cache-Control', 'public, max-age=31536000')
}

var initializeMimeTypes = function (config) {
  if (config && config.mime) {
    _.forEach(config.mime, function (value, key) {
      var map = {}
      map[key] = value
      mime.define(map)
    })
  }
}

// PUBLIC API
exports.PromiseContainer = PromiseContainer
exports.createServeFile = createServeFile
exports.setNoCacheHeaders = setNoCacheHeaders
exports.setHeavyCacheHeaders = setHeavyCacheHeaders
exports.initializeMimeTypes = initializeMimeTypes
exports.serve404 = serve404
