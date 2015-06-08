request = require 'supertest-as-promised'
di = require 'di'
Promise = require 'bluebird'
mocks = require 'mocks'

describe 'web-server', ->

  File = require('../../lib/file_list').File

  EventEmitter = require('events').EventEmitter

  _mocks = {}
  _globals = {__dirname: '/karma/lib'}

  _mocks.fs = mocks.fs.create
    karma:
      static:
        'client.html':  mocks.fs.file(0, 'CLIENT HTML')
    base:
      path:
        'one.js': mocks.fs.file(0, 'js-source')

  # NOTE(vojta): only loading once, to speed things up
  # this relies on the fact that none of these tests mutate fs
  m = mocks.loadFile __dirname + '/../../lib/web-server.js', _mocks, _globals

  customFileHandlers = server = emitter = null

  servedFiles = (files) ->
    emitter.emit 'file_list_modified', Promise.resolve({included: [], served: files})

  beforeEach ->
    customFileHandlers = []
    emitter = new EventEmitter

    injector = new di.Injector [{
      config: ['value', {basePath: '/base/path', urlRoot: '/'}]
      customFileHandlers: ['value', customFileHandlers],
      emitter: ['value', emitter],
      fileList: ['value', null],
      capturedBrowsers: ['value', null],
      reporter: ['value', null],
      executor: ['value', null]
    }]

    server = injector.invoke m.createWebServer
    servedFiles []

  it 'should serve client.html', () ->
    request(server)
    .get('/')
    .expect(200, 'CLIENT HTML')

  it 'should serve source files', () ->
    servedFiles [new File '/base/path/one.js']

    request(server)
    .get('/base/one.js')
    .expect(200, 'js-source')

  it 'should load custom handlers', () ->
    # TODO(vojta): change this, only keeping because karma-dart is relying on it
    customFileHandlers.push {
      urlRegex: /\/some\/weird/
      handler: (request, response, staticFolder, adapterFolder, baseFolder, urlRoot) ->
        response.writeHead 222
        response.end 'CONTENT'
    }

    request(server)
    .get('/some/weird/url')
    .expect(222, 'CONTENT')

  it 'should serve 404 for non-existing files', () ->
    request(server)
    .get('/non/existing.html')
    .expect(404)
