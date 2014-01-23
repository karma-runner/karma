describe 'middleware.strip_host', ->
  q = require 'q'

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  File = require('../../../lib/file_list').File
  Url = require('../../../lib/file_list').Url

  fsMock = mocks.fs.create
    base:
      path:
        'a.js': mocks.fs.file(0, 'js-src-a')
        'index.html': mocks.fs.file(0, '<html>')
    src:
      'some.js': mocks.fs.file(0, 'js-source')
    'utf8ášč':
      'some.js': mocks.fs.file(0, 'utf8-file')


  serveFile = require('../../../lib/middleware/common').createServeFile fsMock, null
  createStripHostMiddleware = require('../../../lib/middleware/strip_host').create

  handler = filesDeferred = nextSpy = response = null

  beforeEach ->
    nextSpy = sinon.spy()
    request = null
    handler = createStripHostMiddleware null, null, '/base/path'

  it 'should strip request with IP number', (done) ->
    request = new HttpRequestMock('http://192.12.31.100/base/a.js?123345')
    handler request, null, nextSpy

    expect(request.normalizedUrl).to.equal '/base/a.js?123345'
    expect(nextSpy).to.have.been.called
    done()

  it 'should strip request with absoluteURI', (done) ->
    request = new HttpRequestMock('http://localhost/base/a.js?123345')
    handler request, null, nextSpy

    expect(request.normalizedUrl).to.equal '/base/a.js?123345'
    expect(nextSpy).to.have.been.called
    done()

  it 'should strip request with absoluteURI and port', (done) ->
    request = new HttpRequestMock('http://localhost:9876/base/a.js?123345')
    handler request, null, nextSpy

    expect(request.normalizedUrl).to.equal '/base/a.js?123345'
    expect(nextSpy).to.have.been.called
    done()

  it 'should strip request with absoluteURI over HTTPS', (done) ->
    request = new HttpRequestMock('https://karma-runner.github.io/base/a.js?123345')
    handler request, null, nextSpy

    expect(request.normalizedUrl).to.equal '/base/a.js?123345'
    expect(nextSpy).to.have.been.called
    done()

  it 'should return same url as passed one', (done) ->
    request = new HttpRequestMock('/base/b.js?123345')
    handler request, null, nextSpy

    expect(request.normalizedUrl).to.equal '/base/b.js?123345'
    expect(nextSpy).to.have.been.called
    done()
