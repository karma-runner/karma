describe 'middleware.source-files', ->
  q = require 'q'

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  File = require('../../../lib/file-list').File
  Url = require('../../../lib/file-list').Url

  fsMock = mocks.fs.create
    base:
      path:
        'a.js': mocks.fs.file(0, 'js-src-a')
    src:
      'some.js': mocks.fs.file(0, 'js-source')
    'utf8ášč':
      'some.js': mocks.fs.file(0, 'utf8-file')


  serveFile = require('../../../lib/middleware/common').createServeFile fsMock, null
  createSourceFilesMiddleware = require('../../../lib/middleware/source-files').create

  handler = filesDeferred = nextSpy = response = null

  beforeEach ->
    nextSpy = sinon.spy()
    response = new HttpResponseMock
    filesDeferred = q.defer()
    handler = createSourceFilesMiddleware filesDeferred.promise, serveFile, '/base/path'

  # helpers
  includedFiles = (files) ->
    filesDeferred.resolve {included: files, served: []}

  servedFiles = (files) ->
    filesDeferred.resolve {included: [], served: files}

  callHandlerWith = (urlPath, next) ->
    promise = handler new HttpRequestMock(urlPath), response, next or nextSpy
    if promise and promise.done then promise.done()


  it 'should serve absolute js source files ignoring timestamp', (done) ->
    servedFiles [
      new File('/src/some.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'js-source'
      done()

    callHandlerWith '/absolute/src/some.js?123345'


  it 'should serve js source files from base folder ignoring timestamp', (done) ->
    servedFiles [
      new File('/base/path/a.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'js-src-a'
      done()

    callHandlerWith '/base/a.js?123345'

  it 'should serve file when requested with absoluteURI with port', (done) ->
    servedFiles [
      new File('/base/path/a.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'js-src-a'
      done()

    callHandlerWith 'http://localhost:9876/base/a.js?123345'

  it 'should serve file when requested with absoluteURI without port', (done) ->
    servedFiles [
      new File('/base/path/a.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'js-src-a'
      done()

    callHandlerWith 'http://localhost/base/a.js?123345'

  it 'should send strict caching headers for js source files with timestamps', (done) ->
    servedFiles [
      new File('/src/some.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response._headers['Cache-Control']).to.deep.equal  ['public', 'max-age=31536000']
      done()

    callHandlerWith '/absolute/src/some.js?12323'


  it 'should send no-caching headers for js source files without timestamps', (done) ->
    ZERO_DATE = (new Date 0).toString()

    servedFiles [
      new File('/src/some.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response._headers['Cache-Control']).to.equal 'no-cache'
      # idiotic IE8 needs more
      expect(response._headers['Pragma']).to.equal 'no-cache'
      expect(response._headers['Expires']).to.equal ZERO_DATE
      done()

    callHandlerWith '/absolute/src/some.js'


  it 'should not serve files that are not in served', (done) ->
    servedFiles []

    callHandlerWith '/absolute/non-existing.html', ->
      expect(response).to.beNotServed()
      done()

  it 'should serve 404 if file is served but does not exist', (done) ->
    servedFiles [
      new File('/non-existing.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 404, 'NOT FOUND'
      done()

    callHandlerWith '/absolute/non-existing.js'


  it 'should serve js source file from base path containing utf8 chars', (done) ->
    servedFiles [
      new File('/utf8ášč/some.js')
    ]

    handler = createSourceFilesMiddleware filesDeferred.promise, serveFile, '/utf8ášč'

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response._body).to.equal 'utf8-file'
      expect(response._status).to.equal 200
      done()

    callHandlerWith '/base/some.js'
