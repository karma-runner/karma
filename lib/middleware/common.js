/**
 * This module contains some common helpers shared between middlewares
 */
'use strict'

const mime = require('mime')
const _ = require('lodash')
const parseRange = require('range-parser')
const Buffer = require('safe-buffer').Buffer
const log = require('../logger').create('web-server')

function createServeFile (fs, directory, config) {
  const cache = Object.create(null)

  return function (filepath, rangeHeader, response, transform, content, doNotCache) {
    let responseData

    function convertForRangeRequest () {
      const range = parseRange(responseData.length, rangeHeader)
      if (range === -2) {
        return 200 // malformed header string
      } else if (range === -1) {
        responseData = Buffer.alloc(0) // unsatisfiable range
        return 416
      } else if (range.type === 'bytes') {
        responseData = Buffer.from(responseData)
        if (range.length === 1) {
          const { start, end } = range[0]
          response.setHeader('Content-Range', `bytes ${start}-${end}/${responseData.length}`)
          response.setHeader('Accept-Ranges', 'bytes')
          response.setHeader('Content-Length', end - start + 1)
          responseData = responseData.slice(start, end + 1)
          return 206
        } else {
          responseData = Buffer.alloc(0) // Multiple ranges are not supported. Maybe future?
          return 416
        }
      }
      return 200 // All other states, ignore
    }

    if (directory) {
      filepath = directory + filepath
    }

    if (!content && cache[filepath]) {
      content = cache[filepath]
    }

    if (config && config.customHeaders && config.customHeaders.length > 0) {
      config.customHeaders.forEach((header) => {
        const regex = new RegExp(header.match)
        if (regex.test(filepath)) {
          log.debug(`setting header: ${header.name} for: ${filepath}`)
          response.setHeader(header.name, header.value)
        }
      })
    }

    if (content && !doNotCache) {
      log.debug(`serving (cached): ${filepath}`)
      response.setHeader('Content-Type', mime.getType(filepath, 'text/plain'))
      responseData = (transform && transform(content)) || content
      response.writeHead(rangeHeader ? convertForRangeRequest() : 200)
      return response.end(responseData)
    }

    return fs.readFile(filepath, function (error, data) {
      if (error) {
        return serve404(response, filepath)
      }

      if (!doNotCache) {
        cache[filepath] = data.toString()
      }

      log.debug('serving: ' + filepath)
      response.setHeader('Content-Type', mime.getType(filepath, 'text/plain'))
      responseData = (transform && transform(data.toString())) || data
      response.writeHead(rangeHeader ? convertForRangeRequest() : 200)

      return response.end(responseData)
    })
  }
}

function serve404 (response, path) {
  log.warn(`404: ${path}`)
  response.writeHead(404)
  return response.end('NOT FOUND')
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
    _.forEach(config.mime, (value, key) => {
      mime.define({ [key]: value }, true)
    })
  }
}

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

// PUBLIC API
exports.PromiseContainer = PromiseContainer
exports.createServeFile = createServeFile
exports.setNoCacheHeaders = setNoCacheHeaders
exports.setHeavyCacheHeaders = setHeavyCacheHeaders
exports.initializeMimeTypes = initializeMimeTypes
exports.serve404 = serve404
