describe 'web-server', ->
  di = require 'di'
  q = require 'q'
  mocks = require 'mocks'

  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  File = require('../../lib/file-list').File

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

  customFileHandlers = server = response = null

  requestPath = (path) ->
    server.emit 'request', new HttpRequestMock(path), response

  servedFiles = (files) ->
    server.updateFilesPromise q.resolve({included: [], served: files})

  beforeEach ->
    customFileHandlers = []

    injector = new di.Injector [{
      config: ['value', {basePath: '/base/path', urlRoot: '/'}]
      customFileHandlers: ['value', customFileHandlers],
      emitter: ['value', null],
      fileList: ['value', null],
      capturedBrowsers: ['value', null],
      reporter: ['value', null]
    }]

    server = injector.invoke m.createWebServer
    server.updateFilesPromise q.resolve({included: [], served: []})
    response = new HttpResponseMock


  it 'should serve client.html', (done) ->
    response.once 'end', ->
      expect(response).to.beServedAs 200, 'CLIENT HTML'
      done()

    requestPath '/'


  it 'should serve source files', (done) ->
    response.once 'end', ->
      expect(response).to.beServedAs 200, 'js-source'
      done()

    servedFiles [new File '/base/path/one.js']
    requestPath '/base/one.js'


  it 'should load custom handlers', (done) ->
    # TODO(vojta): change this, only keeping because karma-dart is relying on it
    customFileHandlers.push {
      urlRegexp: /\/some\/weird/
      handler: (request, response, staticFolder, adapterFolder, baseFolder, urlRoot) ->
        response.writeHead 222
        response.end 'CONTENT'
    }

    response.once 'end', ->
      expect(response).to.beServedAs 222, 'CONTENT'
      done()

    requestPath '/some/weird/url'


  it 'should serve 404 for non-existing files', (done) ->
    response.once 'end', ->
      expect(response).to.beServedAs 404, 'NOT FOUND'
      done()

    requestPath '/non/existing.html'
