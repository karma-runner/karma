#==============================================================================
# lib/web-server.js module
#==============================================================================
describe 'web-server', ->
  util = require '../test-util'
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  staticFolderPath = '/tcular/static'
  adapterFolderPath = '/tcular/adapter'
  baseFolder = '/base/path'

  beforeEach util.disableLogger

  mocks = {}

  mocks['http-proxy'] = {}
  servedFiles = includedFiles = handler = response = null
  ZERO_DATE = (new Date 0).toString()

  # mock fileList
  fileList =
    getServedFiles: -> servedFiles
    getIncludedFiles: -> includedFiles

  # async helper
  waitForFinishingResponse = ->
    waitsFor (-> response._isFinished()), 'Finish response', 100

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

  describe 'integration tests', ->
    handler = null
    mockProxy = {}
    actualOptions = null

    mockProxy.on = ->
    mockProxy.proxyRequest = (req, res, opt) ->
      actualOptions = opt
      res.writeHead 200
      res.end 'DONE'

    beforeEach ->
      # TODO(vojta): use real File (file-list.File)
      servedFiles = includedFiles = [{path: '/first.js', contentPath: '/first.js', mtime: new Date 12345},
        {path: '/second.js', contentPath: '/second.js', mtime: new Date 67890},
        {path: '/base/path/a.js', contentPath: '/base/path/a.js', mtime: new Date 12345}]

      handler = m.createHandler fileList, staticFolderPath, adapterFolderPath, baseFolder, mockProxy,
          {'/_testacular_/': 'http://localhost:9000', '/base/': 'http://localhost:1000'}, '/_testacular_/'
      actualOptions = {}
      response = new httpMock.ServerResponse()


    it 'should first look for testacular files', ->
      handler new httpMock.ServerRequest('/_testacular_/'), response

      # TODO(vojta): refactor to waitForFinishingResponseAnd ->
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CLIENT HTML'
        expect(response._status).toBe 200
        expect(actualOptions).toEqual {}


    it 'should check for forbidden files before serving', ->
      handler = m.createHandler fileList, staticFolderPath, adapterFolderPath, baseFolder, mockProxy,
          {'/_testacular_/': 'http://localhost:9000'}, '/_testacular_/'
      handler new httpMock.ServerRequest('/base/other.js'), response
      waitForFinishingResponse()

      runs ->
        expect(response._status).toBe 404
        expect(response._body).toBe 'NOT FOUND'


    it 'should serve static files after proxy', ->
      handler new httpMock.ServerRequest('/base/a.js'), response
      waitForFinishingResponse()

      runs ->
        expect(response._body).toBe 'js-src-a'
        expect(response._status).toBe 200


    it 'should delegate to proxy after checking for testacular files', ->
      handler new httpMock.ServerRequest('/_testacular_/not_client.html'), response
      waitForFinishingResponse()

      runs ->
        expect(actualOptions).toEqual {host: 'localhost', port: '9000'}


    it 'should delegate to proxy after checking for source files', ->
      handler new httpMock.ServerRequest('/base/not_client.html'), response
      waitForFinishingResponse()

      runs ->
        expect(actualOptions).toEqual {host: 'localhost', port: '1000'}


    it 'should give 404 for missing files', ->
      handler new httpMock.ServerRequest('/file/non-existent.html'), response
      waitForFinishingResponse()

      runs ->
        expect(response._status).toBe 404
        expect(response._body).toBe 'NOT FOUND'


  describe 'testacular source handler', ->

    tcularSrcHandler = null
    beforeEach ->
      response = new httpMock.ServerResponse
      servedFiles = []
      globals.process.platform = 'darwin'
      tcularSrcHandler = m.createTestacularSourceHandler fileList, staticFolderPath, adapterFolderPath, baseFolder, '/_testacular_/'


    it 'should serve client.html', ->
      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CLIENT HTML'
        expect(response._status).toBe 200


    it 'should allow /?id=xxx', ->
      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/?id=123'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CLIENT HTML'
        expect(response._status).toBe 200


    it 'should serve context.html with replaced script tags', ->
      includedFiles = [{path: '/first.js', mtime: new Date 12345},
        {path: '/second.js', mtime: new Date 67890}]

      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/context.html'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/first.js?12345"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js?67890"></script>'
        expect(response._status).toBe 200


    it 'should serve debug.html with replaced script tags without timestamps', ->
      includedFiles = [{path: '/first.js', mtime: new Date 12345},
        {path: '/second.js', mtime: new Date 67890}]

      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/debug.html'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'RUNNER\n' +
        '<script type="text/javascript" src="/absolute/first.js"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js"></script>'
        expect(response._status).toBe 200


    it 'should serve context.html with /basepath/*, /adapter/*, /absolute/* ', ->
      includedFiles = [{path: '/some/abs/a.js', mtime: new Date 12345},
        {path: '/base/path/b.js', mtime: new Date 67890},
        {path: '/tcular/adapter/c.js', mtime: new Date 321}]

      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/context.html'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/some/abs/a.js?12345"></script>\n' +
        '<script type="text/javascript" src="/base/b.js?67890"></script>\n' +
        '<script type="text/javascript" src="/adapter/c.js?321"></script>'
        expect(response._status).toBe 200


    it 'should not change urls', ->
      includedFiles = [{path: 'http://some.url.com/whatever', isUrl: true}]

      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/context.html'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="http://some.url.com/whatever"></script>'
        expect(response._status).toBe 200


    it 'should send non-caching headers for context.html', ->
      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_/context.html'), response
      expect(retVal).toBeTruthy()
      waitForFinishingResponse()

      runs ->
        expect(response._headers['Cache-Control']).toBe 'no-cache'
        # idiotic IE8 needs more
        expect(response._headers['Pragma']).toBe 'no-cache'
        expect(response._headers['Expires']).toBe ZERO_DATE


    it 'should inline mappings with all served files', ->
      mocks.fs._touchFile '/tcular/static/context.html', 0, '%MAPPINGS%'

      includedFiles = []
      servedFiles = [{path: '/some/abs/a.js', mtime: new Date 12345},
        {path: '/base/path/b.js', mtime: new Date 67890},
        {path: '/tcular/adapter/c.js', mtime: new Date 321}]

      tcularSrcHandler new httpMock.ServerRequest('/_testacular_/context.html'), response
      waitForFinishingResponse()

      runs ->
        expect(response._body).toEqual 'window.__testacular__.files = {\n' +
        "  '/absolute/some/abs/a.js': '12345',\n" +
        "  '/base/b.js': '67890',\n" +
        "  '/adapter/c.js': '321'\n" +
        "};\n"

        expect(response._status).toBe 200


    it 'should redirect urlRoot without trailing slash', ->
      retVal = tcularSrcHandler new httpMock.ServerRequest('/_testacular_'), response
      expect(retVal).toBe true
      waitForFinishingResponse()

      runs ->
        expect(response._status).toBe 301
        expect(response._headers['Location']).toBe '/_testacular_/'


  describe 'source files handler', ->
    srcFileHandler = null

    beforeEach ->
      response = new httpMock.ServerResponse
      srcFileHandler = m.createSourceFileHandler fileList, '/tcular/adapter', '/base/path'


    it 'should serve absolute js source files ignoring timestamp', ->
      servedFiles = [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js?123345'), response
      waitForFinishingResponse()

      runs ->
        expect(response._body).toBe 'js-source'
        expect(response._status).toBe 200


    it 'should serve js source files from base folder ignoring timestamp', ->
      servedFiles = [{path: '/base/path/a.js', contentPath: '/base/path/a.js', mtime: new Date 12345}]

      srcFileHandler new httpMock.ServerRequest('/base/a.js?123345'), response

      waitForFinishingResponse()

      runs ->
        expect(response._body).toBe 'js-src-a'
        expect(response._status).toBe 200


    it 'should serve js source files from adapter folder ignoring timestamp', ->
      servedFiles = [{path: '/tcular/adapter/jasmine.js', contentPath: '/tcular/adapter/jasmine.js', mtime: new Date 12345}]

      srcFileHandler new httpMock.ServerRequest('/adapter/jasmine.js?123345'), response
      waitForFinishingResponse()

      runs ->
        expect(response._body).toBe 'js-src-jasmine'
        expect(response._status).toBe 200


    it 'should send strict caching headers for js source files with timestamps', ->
      servedFiles = [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js?12323'), response
      waitForFinishingResponse()

      runs ->
        expect(response._headers['Cache-Control']).toEqual ['public', 'max-age=31536000']


    it 'should send no-caching headers for js source files without timestamps', ->
      servedFiles = [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js'), response
      waitForFinishingResponse()

      runs ->
        expect(response._headers['Cache-Control']).toBe 'no-cache'
        # idiotic IE8 needs more
        expect(response._headers['Pragma']).toBe 'no-cache'
        expect(response._headers['Expires']).toBe ZERO_DATE


    it 'should return false for non-existing servedFiles', ->
      expect(srcFileHandler new httpMock.ServerRequest('/base/non-existing.html'), response).toBeFalsy()


    it 'should not allow resources that are not in the file list', ->
      response = new httpMock.ServerResponse
      servedFiles = [{path: '/first.js', mtime: new Date 12345},
        {path: '/second.js', mtime: new Date 67890}]

      runs ->
        expect(srcFileHandler new httpMock.ServerRequest('/base/other.js'), response).toBeFalsy()

