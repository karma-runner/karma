/**
 * This module contains some common helpers shared between middlewares
 */
'use strict'

const mime = require('mime')
const _ = require('lodash')
const parseRange = require('range-parser')
const Buffer = require('safe-buffer').Buffer

const log = require('../logger').create('web-server')

class PromiseContainer {
  constructor () {
    this.promise = null
  }

  then (success, error) {
    return this.promise.then(success, error)
  }

  set (newPromise) {
    this.promise = newPromise
  }
}

function serve404 (response, path) {
  log.warn('404: ' + path)
  response.writeHead(404)
  return response.end('NOT FOUND')
}

function createServeFile (fs, directory, config) {
  const cache = Object.create(null)

  return function (filepath, rangeHeader, response, transform, content, doNotCache) {
    let responseData

    const convertForRangeRequest = function () {
      const range = parseRange(responseData.length, rangeHeader)
      if (range === -2) {
        // malformed header string
        return 200
      } else if (range === -1) {
        // unsatisfiable range
        responseData = Buffer.alloc(0)
        return 416
      } else if (range.type === 'bytes') {
        responseData = Buffer.from(responseData)
        if (range.length === 1) {
          const start = range[0].start
          const end = range[0].end
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
          responseData = Buffer.alloc(0)
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
        const regex = new RegExp(header.match)
        if (regex.test(filepath)) {
          log.debug('setting header: ' + header.name + ' for: ' + filepath)
          response.setHeader(header.name, header.value)
        }
      })
    }

    // serve from cache
    if (content && !doNotCache) {
      response.setHeader('Content-Type', mime.getType(filepath, 'text/plain'))

      // call custom transform fn to transform the data
      responseData = (transform && transform(content)) || content

      response.writeHead(rangeHeader ? convertForRangeRequest() : 200)

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

      response.setHeader('Content-Type', mime.getType(filepath, 'text/plain'))

      // call custom transform fn to transform the data
      responseData = (transform && transform(data.toString())) || data

      response.writeHead(rangeHeader ? convertForRangeRequest() : 200)

      log.debug('serving: ' + filepath)
      return response.end(responseData)
    })
  }
}

function setNoCacheHeaders (response) {
  response.setHeader('Cache-Control', 'no-cache')
  response.setHeader('Pragma', 'no-cache')
  response.setHeader('Expires', (new Date(0)).toUTCString())
}

function setHeavyCacheHeaders (response) {
  response.setHeader('Cache-Control', 'public, max-age=31536000')
}

function initializeMimeTypes (config) {
  if (config && config.mime) {
    _.forEach(config.mime, function (value, key) {
      const map = {}
      map[key] = value
      mime.define(map, true)
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
