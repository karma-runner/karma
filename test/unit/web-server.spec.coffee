#==============================================================================
# lib/web-server.js module
#==============================================================================
describe 'web-server', ->
  util = require '../test-util'
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  beforeEach util.disableLogger

  files = handler = response = null
  ZERO_DATE = (new Date 0).toString()

  # mock fileList
  fileList =
    getFiles: -> files

  # async helper
  waitForFinishingResponse = ->
    waitsFor (-> response._isFinished()), 'Finish response', 100

  mocks = {}
  mocks.fs = fsMock.create
    tcular:
      adapter:
        'jasmine.js': fsMock.file(0, 'js-src-jasmine')
      static:
        'client.html':  fsMock.file(0, 'CLIENT HTML'),
        'context.html': fsMock.file(0, 'CONTEXT\n%SCRIPTS%'),
        'debug.html': fsMock.file(0, 'RUNNER\n%SCRIPTS%')
    base:
      path:
        'a.js': fsMock.file(0, 'js-src-a')
        'other.js': fsMock.file(0, 'js-src-other')
    src:
      'some.js': fsMock.file(0, 'js-source')
    other:
      'file.js': fsMock.file(0, 'js-source')

  globals = process: {}

  # load file under test
  m = loadFile __dirname + '/../../lib/web-server.js', mocks, globals

  beforeEach ->
    handler = m.createHandler fileList, '/tcular/static', '/tcular/adapter', '/base/path'
    response = new httpMock.ServerResponse
    files = []
    globals.process.platform = 'darwin'


  it 'should server client.html', ->
    handler new httpMock.ServerRequest('/'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CLIENT HTML'
      expect(response._status).toBe 200


  it 'should allow /?id=xxx', ->
    handler new httpMock.ServerRequest('/?id=123'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CLIENT HTML'
      expect(response._status).toBe 200


  it 'should server context.html with replaced script tags', ->
    files = [{path: '/first.js', mtime: new Date 12345},
             {path: '/second.js', mtime: new Date 67890}]

    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/first.js?12345"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js?67890"></script>'
      expect(response._status).toBe 200


  it 'should server debug.html with replaced script tags without timestamps', ->
    files = [{path: '/first.js', mtime: new Date 12345},
             {path: '/second.js', mtime: new Date 67890}]

    handler new httpMock.ServerRequest('/debug.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'RUNNER\n' +
        '<script type="text/javascript" src="/absolute/first.js"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js"></script>'
      expect(response._status).toBe 200


  it 'should serve context.html with /basepath/*, /adapter/*, /absolute/* ', ->
    files = [{path: '/some/abs/a.js', mtime: new Date 12345},
             {path: '/base/path/b.js', mtime: new Date 67890},
             {path: '/tcular/adapter/c.js', mtime: new Date 321}]

    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/some/abs/a.js?12345"></script>\n' +
        '<script type="text/javascript" src="/base/b.js?67890"></script>\n' +
        '<script type="text/javascript" src="/adapter/c.js?321"></script>'
      expect(response._status).toBe 200


  it 'should not change urls', ->
    files = [{path: 'http://some.url.com/whatever', isUrl: true}]

    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="http://some.url.com/whatever"></script>'
      expect(response._status).toBe 200


  it 'should send non-caching headers for context.html', ->
    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._headers['Cache-Control']).toBe 'no-cache'
      # idiotic IE8 needs more
      expect(response._headers['Pragma']).toBe 'no-cache'
      expect(response._headers['Expires']).toBe ZERO_DATE


  it 'should serve absolute js source files ignoring timestamp', ->
    files = [{path: '/src/some.js', mtime: new Date 12345}]

    handler new httpMock.ServerRequest('/absolute/src/some.js?123345'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'js-source'
      expect(response._status).toBe 200


  it 'should serve js source files from base folder ignoring timestamp', ->
    files = [{path: '/base/path/a.js', mtime: new Date 12345}]

    handler new httpMock.ServerRequest('/base/a.js?123345'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'js-src-a'
      expect(response._status).toBe 200


  it 'should serve js source files from adapter folder ignoring timestamp', ->
    files = [{path: '/tcular/adapter/jasmine.js', mtime: new Date 12345}]

    handler new httpMock.ServerRequest('/adapter/jasmine.js?123345'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'js-src-jasmine'
      expect(response._status).toBe 200


  it 'should send strict caching headers for js source files with timestamps', ->
    files = [{path: '/src/some.js', mtime: new Date 12345}]

    handler new httpMock.ServerRequest('/absolute/src/some.js?12323'), response
    waitForFinishingResponse()

    runs ->
      expect(response._headers['Cache-Control']).toEqual ['public', 'max-age=31536000']


  it 'should send no-caching headers for js source files without timestamps', ->
    files = [{path: '/src/some.js', mtime: new Date 12345}]

    handler new httpMock.ServerRequest('/absolute/src/some.js'), response
    waitForFinishingResponse()

    runs ->
      expect(response._headers['Cache-Control']).toBe 'no-cache'
      # idiotic IE8 needs more
      expect(response._headers['Pragma']).toBe 'no-cache'
      expect(response._headers['Expires']).toBe ZERO_DATE


  it 'should serve 404 page for non-existing files', ->
    handler new httpMock.ServerRequest('/base/non-existing.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'NOT FOUND'
      expect(response._status).toBe 404


  it 'should not allow resources that are not in the file list', ->
    files = [{path: '/first.js', mtime: new Date 12345},
             {path: '/second.js', mtime: new Date 67890}]

    runs ->
      handler new httpMock.ServerRequest('/base/other.js'), response
      waitForFinishingResponse()

    runs ->
      expect(response._status).toBe 404
      expect(response._body).toBe 'NOT FOUND'
