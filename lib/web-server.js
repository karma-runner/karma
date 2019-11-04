'use strict'

const fs = require('graceful-fs')
const http = require('http')
const https = require('https')
const path = require('path')
const connect = require('connect')
const mimeType = require('mime')

const common = require('./middleware/common')
const runnerMiddleware = require('./middleware/runner')
const stopperMiddleware = require('./middleware/stopper')
const karmaMiddleware = require('./middleware/karma')
const sourceFilesMiddleware = require('./middleware/source_files')
const proxyMiddleware = require('./middleware/proxy')

const log = require('./logger').create('web-server')

function createCustomHandler (customFileHandlers, config) {
  return function (request, response, next) {
    const handler = customFileHandlers.find((handler) => handler.urlRegex.test(request.url))
    return handler
      ? handler.handler(request, response, 'fake/static', 'fake/adapter', config.basePath, 'fake/root')
      : next()
  }
}

createCustomHandler.$inject = ['customFileHandlers', 'config']

function createFilesPromise (emitter, fileList) {
  // Set an empty list of files to avoid race issues with
  // file_list_modified not having been emitted yet
  let files = fileList.files
  emitter.on('file_list_modified', (filesParam) => { files = filesParam })

  return {
    then (...args) {
      return Promise.resolve(files).then(...args)
    }
  }
}

function createServeStaticFile (config) {
  return common.createServeFile(fs, path.normalize(path.join(__dirname, '/../static')), config)
}
createServeStaticFile.$inject = ['config']

function createServeFile (config) {
  return common.createServeFile(fs, null, config)
}
createServeFile.$inject = ['config']

function createWebServer (injector, config) {
  const { mime = {} } = config
  mimeType.define({ ...mime }, true)

  const proxyMiddlewareInstance = injector.invoke(proxyMiddleware.create)

  log.debug('Instantiating middleware')
  const handler = connect()

  if (config.beforeMiddleware) {
    config.beforeMiddleware.forEach((middleware) => handler.use(injector.get('middleware:' + middleware)))
  }

  handler.use(injector.invoke(runnerMiddleware.create))
  handler.use(injector.invoke(stopperMiddleware.create))
  handler.use(injector.invoke(karmaMiddleware.create))
  handler.use(injector.invoke(sourceFilesMiddleware.create))
  // TODO(vojta): extract the proxy into a plugin
  handler.use(proxyMiddlewareInstance)
  // TODO(vojta): remove, this is only here because of karma-dart
  // we need a better way of custom handlers
  handler.use(injector.invoke(createCustomHandler))

  if (config.middleware) {
    config.middleware.forEach((middleware) => handler.use(injector.get('middleware:' + middleware)))
  }

  handler.use((request, response) => common.serve404(response, request.url))

  let serverClass = http
  const serverArguments = [handler]

  if (config.protocol === 'https:') {
    serverClass = https
    serverArguments.unshift(config.httpsServerOptions || {})
  }

  if (config.httpModule) {
    serverClass = config.httpModule
  }

  const server = serverClass.createServer.apply(null, serverArguments)

  server.on('upgrade', function (req, socket, head) {
    log.debug(`upgrade ${req.url}`)
    proxyMiddlewareInstance.upgrade(req, socket, head)
  })

  return server
}

createWebServer.$inject = ['injector', 'config']

module.exports = {
  createWebServer,
  createServeFile,
  createServeStaticFile,
  createFilesPromise
}
