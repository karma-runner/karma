describe 'middleware.karma', ->
  q = require 'q'
  constants = require '../../../lib/constants'

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  File = require('../../../lib/file-list').File
  Url = require('../../../lib/file-list').Url

  MockFile = (path, sha) ->
    File.call @, path
    @sha = sha or 'sha-default'

  fsMock = mocks.fs.create
    karma:
      static:
        'client.html':  mocks.fs.file(0, 'CLIENT HTML')
        'context.html': mocks.fs.file(0, 'CONTEXT\n%SCRIPTS%')
        'debug.html': mocks.fs.file(0, 'DEBUG\n%SCRIPTS%')
        'karma.js': mocks.fs.file(0, 'root: %KARMA_URL_ROOT%, v: %KARMA_VERSION%')

  serveFile = require('../../../lib/middleware/common').createServeFile fsMock, '/karma/static'
  createKarmaMiddleware = require('../../../lib/middleware/karma').create

  handler = filesDeferred = nextSpy = response = null

  beforeEach ->
    nextSpy = sinon.spy()
    response = new HttpResponseMock
    filesDeferred = q.defer()
    handler = createKarmaMiddleware filesDeferred.promise, serveFile, '/base/path', '/__karma__/'

  # helpers
  includedFiles = (files) ->
    filesDeferred.resolve {included: files, served: []}

  servedFiles = (files) ->
    filesDeferred.resolve {included: [], served: files}

  callHandlerWith = (urlPath, next) ->
    promise = handler new HttpRequestMock(urlPath), response, next or nextSpy
    if promise and promise.done then promise.done()


  it 'should redirect urlRoot without trailing slash', (done) ->
    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 301, 'MOVED PERMANENTLY'
      expect(response._headers['Location']).to.equal '/__karma__/'
      done()

    callHandlerWith '/__karma__'


  it 'should not serve outside of urlRoot', ->
    handler new HttpRequestMock('/'), null, nextSpy
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler new HttpRequestMock('/client.html'), null, nextSpy
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler new HttpRequestMock('/debug.html'), null, nextSpy
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler new HttpRequestMock('/context.html'), null, nextSpy
    expect(nextSpy).to.have.been.called


  it 'should serve client.html', (done) ->
    handler = createKarmaMiddleware null, serveFile, '/base', '/'

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CLIENT HTML'
      done()

    callHandlerWith '/'


  it 'should serve /?id=xxx', (done) ->
    handler = createKarmaMiddleware null, serveFile, '/base', '/'

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CLIENT HTML'
      done()

    callHandlerWith '/?id=123'


  it 'should serve karma.js with version and urlRoot variables', (done) ->
    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'root: /__karma__/, v: ' + constants.VERSION
      expect(response._headers['Content-Type']).to.equal 'application/javascript'
      done()

    callHandlerWith '/__karma__/karma.js'


  it 'should serve context.html with replaced script tags', (done) ->
    includedFiles [
      new MockFile('/first.js', 'sha123')
      new MockFile('/second.dart', 'sha456')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CONTEXT\n' +
      '<script type="text/javascript" src="/absolute/first.js?sha123"></script>\n' +
      '<script type="application/dart" src="/absolute/second.dart?sha456"></script>'
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should serve context.html with replaced link tags', (done) ->
    includedFiles [
      new MockFile('/first.css', 'sha007')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CONTEXT\n' +
      '<link type="text/css" href="/absolute/first.css?sha007" rel="stylesheet">'
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should serve context.html with the correct path for the script tags', (done) ->
    includedFiles [
      new MockFile('/some/abc/a.js', 'sha')
      new MockFile('/base/path/b.js', 'shaaa')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CONTEXT\n' +
      '<script type="text/javascript" src="/absolute/some/abc/a.js?sha"></script>\n' +
      '<script type="text/javascript" src="/base/b.js?shaaa"></script>'
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should serve context.html with the correct path for link tags', (done) ->
    includedFiles [
      new MockFile('/some/abc/a.css', 'sha1')
      new MockFile('/base/path/b.css', 'sha2')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'CONTEXT\n' +
      '<link type="text/css" href="/absolute/some/abc/a.css?sha1" rel="stylesheet">\n' +
      '<link type="text/css" href="/base/b.css?sha2" rel="stylesheet">'
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should not change urls', (done) ->
    includedFiles [
      new Url('http://some.url.com/whatever')
    ]

    response.once 'end', ->
      expect(response).to.beServedAs 200, 'CONTEXT\n' +
      '<script type="text/javascript" src="http://some.url.com/whatever"></script>'
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should send non-caching headers for context.html', (done) ->
    ZERO_DATE = (new Date 0).toString()

    includedFiles []

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response._headers['Cache-Control']).to.equal 'no-cache'
      # idiotic IE8 needs more
      expect(response._headers['Pragma']).to.equal 'no-cache'
      expect(response._headers['Expires']).to.equal ZERO_DATE
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should inline mappings with all served files', (done) ->
    fsMock._touchFile '/karma/static/context.html', 0, '%MAPPINGS%'
    servedFiles [
      new MockFile('/some/abc/a.js', 'sha_a')
      new MockFile('/base/path/b.js', 'sha_b')
    ]

    response.once 'end', ->
      expect(response).to.beServedAs 200, 'window.__karma__.files = {\n' +
      "  '/absolute/some/abc/a.js': 'sha_a',\n" +
      "  '/base/b.js': 'sha_b'\n" +
      "};\n"
      done()

    callHandlerWith '/__karma__/context.html'


  it 'should serve debug.html with replaced script tags without timestamps', (done) ->
    includedFiles [
      new MockFile('/first.js')
      new MockFile('/base/path/b.js')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'DEBUG\n' +
      '<script type="text/javascript" src="/absolute/first.js"></script>\n' +
      '<script type="text/javascript" src="/base/b.js"></script>'
      done()

    callHandlerWith '/__karma__/debug.html'


  it 'should serve debug.html with replaced link tags without timestamps', (done) ->
    includedFiles [
      new MockFile('/first.css')
      new MockFile('/base/path/b.css')
    ]

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, 'DEBUG\n' +
      '<link type="text/css" href="/absolute/first.css" rel="stylesheet">\n' +
      '<link type="text/css" href="/base/b.css" rel="stylesheet">'
      done()

    callHandlerWith '/__karma__/debug.html'


  it 'should not serve other files even if they are in urlRoot', (done) ->
    includedFiles []

    callHandlerWith '/__karma__/something/else.js', ->
      expect(response).to.beNotServed()
      done()







    # it 'should invoke custom handler', (done) ->
    #   response.once 'end', ->
    #     expect(nextSpy).not.to.have.been.called
    #     expect(response.statusCode).to.equal 200
    #     expect(response._content.toString()).to.equal 'Hello World'
    #     done()

    #   customHandler =
    #     urlRegex: /\/test/,
    #     handler: (request, response, staticFolder, adapterFolder, baseFolder, urlRoot) ->
    #       response.end 'Hello World'

    #   karmaSrcHandler = m.createKarmaSourceHandler promiseContainer, staticFolderPath,
    #       adapterFolderPath, baseFolder, '/_karma_/', [customHandler], []
    #   karmaSrcHandler new httpMock.ServerRequest('/_karma_/test'), response, nextSpy


    # it 'should set custom script type', (done) ->
    #   mocks.fs._touchFile '/karma/static/context.html', 0, 'CONTEXT\n%SCRIPTS%'
    #   includedFiles [{path: 'http://some.url.com/whatever.blah', isUrl: true}]

    #   response.once 'end', ->
    #     expect(response._content.toString()).to.equal  'CONTEXT\n' +
    #         '<script type="application/blah" src="http://some.url.com/whatever.blah"></script>'
    #     expect(response.statusCode).to.equal 200
    #     done()

    #   customScriptType =
    #     extension: 'blah',
    #     contentType: 'application/blah'

    #   karmaSrcHandler = m.createKarmaSourceHandler promiseContainer, staticFolderPath,
    #       adapterFolderPath, baseFolder, '/_karma_/', [], [customScriptType]

    #   karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy
