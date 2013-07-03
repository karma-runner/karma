#==============================================================================
# lib/web-server.js module
#==============================================================================
describe 'web-server', ->
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  responseMock = require('mock-http-response')
  loadFile = require('mocks').loadFile
  q = require 'q'

  staticFolderPath = '/karma/static'
  adapterFolderPath = '/karma/adapter'
  baseFolder = '/base/path'

  mocks = 'http-proxy': {}, pause: require('pause')
  nextSpy = handler = response = null
  ZERO_DATE = (new Date 0).toString()

  promiseContainer = {}

  includedFiles = (files) ->
    promiseContainer.promise = q.resolve {included: files, served: []}

  servedFiles = (files) ->
    promiseContainer.promise = q.resolve {served: files, included: []}

  # TODO(vojta): use real File (file-list.File)
  defaultFiles = [
    {path: '/first.js', contentPath: '/first.js', mtime: new Date 12345},
    {path: '/second.js', contentPath: '/second.js', mtime: new Date 67890},
    {path: '/base/path/a.js', contentPath: '/base/path/a.js', mtime: new Date 12345}
  ]


  mocks.fs = fsMock.create
    karma:
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

  #============================================================================
  # Integration Tests
  #============================================================================
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
      servedFiles defaultFiles
      handler = m.createHandler promiseContainer, staticFolderPath, adapterFolderPath, baseFolder,
          mockProxy, {'/_karma_/': 'http://localhost:9000', '/base/': 'http://localhost:1000'},
          '/_karma_/', [], [], true
      actualOptions = {}
      response = new responseMock()
      nextSpy = sinon.spy()


    it 'should first look for karma files', ->
      response.once 'end', ->
        expect(response._content.toString()).to.equal  'CLIENT HTML'
        expect(response.statusCode).to.equal  200
        expect(actualOptions).to.deep.equal {}

      handler new httpMock.ServerRequest('/_karma_/'), response


    it 'should check for forbidden files before serving', (done) ->
      handler = m.createHandler promiseContainer, staticFolderPath, adapterFolderPath, baseFolder,
          mockProxy, {'/_karma_/': 'http://localhost:9000'}, '/_karma_/'

      response.once 'end', ->
        expect(response.statusCode).to.equal 404
        expect(response._content.toString()).to.equal 'NOT FOUND'
        done()

      handler new httpMock.ServerRequest('/base/other.js'), response


    it 'should serve static files after proxy', ->
      response.once 'end', -> response.once 'end', ->
        expect(response._content.toString()).to.equal 'js-src-a'
        expect(response.statusCode).to.equal 200

      handler new httpMock.ServerRequest('/base/a.js'), response


    it 'should delegate to proxy after checking for karma files', (done) ->
      response.once 'end', ->
        expect(actualOptions).to.deep.equal  {
          host: 'localhost',
          port: '9000',
          target:{https:false, rejectUnauthorized:true}
          }
        done()

      handler new httpMock.ServerRequest('/_karma_/not_client.html'), response


    it 'should delegate to proxy after checking for source files', (done) ->
      response.once 'end', ->
        expect(actualOptions).to.deep.equal  {
          host: 'localhost',
          port: '1000',
          target:{https:false, rejectUnauthorized:true}
          }
        done()

      handler new httpMock.ServerRequest('/base/not_client.html'), response


    it 'should give 404 for missing files', (done) ->
      response.once 'end', ->
        expect(response.statusCode).to.equal 404
        expect(response._content.toString()).to.equal 'NOT FOUND'
        done()

      handler new httpMock.ServerRequest('/file/non-existent.html'), response


  #============================================================================
  # Karma Source Handler
  #============================================================================
  describe 'karma source handler', ->

    karmaSrcHandler = null

    beforeEach ->
      includedFiles defaultFiles
      response = new responseMock
      globals.process.platform = 'darwin'
      karmaSrcHandler = m.createKarmaSourceHandler promiseContainer, staticFolderPath,
          adapterFolderPath, baseFolder, '/_karma_/', [], []


    it 'should serve client.html', (done) ->
      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CLIENT HTML'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/'), response, nextSpy


    it 'should allow /?id=xxx', (done) ->
      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CLIENT HTML'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/?id=123'), response, nextSpy


    it 'should serve context.html with replaced script tags', ->
      includedFiles [{path: '/first.js', mtime: new Date 12345},
          {path: '/second.js', mtime: new Date 67890}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/first.js?12345"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js?67890"></script>'
        expect(response.statusCode).to.equal 200

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy

    it 'should serve context.html with replaced link tags', ->
      includedFiles [{path: '/first.css', mtime: new Date 12345},
        {path: '/second.css', mtime: new Date 67890}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
        '<link type="text/css" href="/absolute/first.css?12345" rel="stylesheet">\n' +
        '<link type="text/css" href="/absolute/second.css?67890" rel="stylesheet">'
        expect(response.statusCode).to.equal 200

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should serve debug.html with replaced script tags without timestamps', (done) ->
      includedFiles [{path: '/first.js', mtime: new Date 12345},
          {path: '/second.js', mtime: new Date 67890}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'RUNNER\n' +
        '<script type="text/javascript" src="/absolute/first.js"></script>\n' +
        '<script type="text/javascript" src="/absolute/second.js"></script>'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/debug.html'), response, nextSpy


    it 'should serve debug.html with replaced link tags without timestamps', (done) ->
      includedFiles [{path: '/first.css', mtime: new Date 12345},
        {path: '/second.css', mtime: new Date 67890}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'RUNNER\n' +
        '<link type="text/css" href="/absolute/first.css" rel="stylesheet">\n' +
        '<link type="text/css" href="/absolute/second.css" rel="stylesheet">'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/debug.html'), response, nextSpy


    it 'should serve context.html with the correct path for script tags', (done) ->
      includedFiles [{path: '/some/abs/a.js', mtime: new Date 12345},
        {path: '/base/path/b.js', mtime: new Date 67890},
        {path: '/karma/adapter/c.js', mtime: new Date 321}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
        '<script type="text/javascript" src="/absolute/some/abs/a.js?12345"></script>\n' +
        '<script type="text/javascript" src="/base/b.js?67890"></script>\n' +
        '<script type="text/javascript" src="/adapter/c.js?321"></script>'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should serve context.html with the correct path for link tags', (done) ->
      includedFiles [{path: '/some/abs/a.css', mtime: new Date 12345},
        {path: '/base/path/b.css', mtime: new Date 67890},
        {path: '/karma/adapter/c.css', mtime: new Date 321}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
        '<link type="text/css" href="/absolute/some/abs/a.css?12345" rel="stylesheet">\n' +
        '<link type="text/css" href="/base/b.css?67890" rel="stylesheet">\n' +
        '<link type="text/css" href="/adapter/c.css?321" rel="stylesheet">'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should not change urls', (done) ->
      includedFiles [{path: 'http://some.url.com/whatever', isUrl: true}]

      response.once 'end', ->
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
        '<script type="text/javascript" src="http://some.url.com/whatever"></script>'
        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should send non-caching headers for context.html', (done) ->
      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response.getHeader('Cache-Control')).to.equal 'no-cache'
        # idiotic IE8 needs more
        expect(response.getHeader('Pragma')).to.equal 'no-cache'
        expect(response.getHeader('Expires')).to.equal ZERO_DATE
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should inline mappings with all served files', (done) ->
      mocks.fs._touchFile '/karma/static/context.html', 0, '%MAPPINGS%'

      servedFiles [{path: '/some/abs/a.js', mtime: new Date 12345},
        {path: '/base/path/b.js', mtime: new Date 67890},
        {path: '/karma/adapter/c.js', mtime: new Date 321}]

      response.once 'end', ->
        expect(response._content.toString()).to.equal 'window.__karma__.files = {\n' +
        "  '/absolute/some/abs/a.js': '12345',\n" +
        "  '/base/b.js': '67890',\n" +
        "  '/adapter/c.js': '321'\n" +
        "};\n"

        expect(response.statusCode).to.equal 200
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


    it 'should redirect urlRoot without trailing slash', (done) ->
      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response.statusCode).to.equal 301
        expect(response.getHeader('Location')).to.equal '/_karma_/'
        done()

      karmaSrcHandler new httpMock.ServerRequest('/_karma_'), response, nextSpy


    it 'should invoke custom handler', (done) ->
      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response.statusCode).to.equal 200
        expect(response._content.toString()).to.equal 'Hello World'
        done()

      customHandler =
        urlRegex: /\/test/,
        handler: (request, response, staticFolder, adapterFolder, baseFolder, urlRoot) ->
          response.end 'Hello World'

      karmaSrcHandler = m.createKarmaSourceHandler promiseContainer, staticFolderPath,
          adapterFolderPath, baseFolder, '/_karma_/', [customHandler], []
      karmaSrcHandler new httpMock.ServerRequest('/_karma_/test'), response, nextSpy


    it 'should set custom script type', (done) ->
      mocks.fs._touchFile '/karma/static/context.html', 0, 'CONTEXT\n%SCRIPTS%'
      includedFiles [{path: 'http://some.url.com/whatever.blah', isUrl: true}]

      response.once 'end', ->
        expect(response._content.toString()).to.equal  'CONTEXT\n' +
            '<script type="application/blah" src="http://some.url.com/whatever.blah"></script>'
        expect(response.statusCode).to.equal 200
        done()

      customScriptType =
        extension: 'blah',
        contentType: 'application/blah'

      karmaSrcHandler = m.createKarmaSourceHandler promiseContainer, staticFolderPath,
          adapterFolderPath, baseFolder, '/_karma_/', [], [customScriptType]

      karmaSrcHandler new httpMock.ServerRequest('/_karma_/context.html'), response, nextSpy


  #============================================================================
  # Source Files Handler
  #============================================================================
  describe 'source files handler', ->

    srcFileHandler = null

    beforeEach ->
      response = new responseMock
      srcFileHandler = m.createSourceFileHandler promiseContainer, '/karma/adapter', '/base/path'


    it 'should serve absolute js source files ignoring timestamp', (done)->
      servedFiles [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal 'js-source'
        expect(response.statusCode).to.equal 200
        done()

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js?123345'), response, nextSpy


    it 'should serve js source files from base folder ignoring timestamp', (done) ->
      servedFiles [{path: '/base/path/a.js', contentPath: '/base/path/a.js', mtime: new Date 12345}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal 'js-src-a'
        expect(response.statusCode).to.equal 200
        done()

      srcFileHandler new httpMock.ServerRequest('/base/a.js?123345'), response, nextSpy


    it 'should serve js source files from adapter folder ignoring timestamp', (done) ->
      servedFiles [{
        path: '/karma/adapter/jasmine.js'
        contentPath: '/karma/adapter/jasmine.js'
        mtime: new Date 12345
      }]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response._content.toString()).to.equal 'js-src-jasmine'
        expect(response.statusCode).to.equal 200
        done()

      srcFileHandler new httpMock.ServerRequest('/adapter/jasmine.js?123345'), response, nextSpy


    it 'should send strict caching headers for js source files with timestamps', (done) ->
      servedFiles [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response.getHeader('Cache-Control')).to.deep.equal  ['public', 'max-age=31536000']
        done()

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js?12323'), response, nextSpy


    it 'should send no-caching headers for js source files without timestamps', (done) ->
      servedFiles [{path: '/src/some.js', contentPath: '/src/some.js', mtime: new Date 12345}]

      response.once 'end', ->
        expect(nextSpy).not.to.have.been.called
        expect(response.getHeader('Cache-Control')).to.equal 'no-cache'
        # idiotic IE8 needs more
        expect(response.getHeader('Pragma')).to.equal 'no-cache'
        expect(response.getHeader('Expires')).to.equal ZERO_DATE
        done()

      srcFileHandler new httpMock.ServerRequest('/absolute/src/some.js'), response, nextSpy


    it 'should return false for non-existing servedFiles', (done) ->
      nextSpy = sinon.spy done
      srcFileHandler new httpMock.ServerRequest('/base/non-existing.html'), response, nextSpy


    it 'should not allow resources that are not in the file list', (done) ->
      response = new responseMock
      nextSpy = sinon.spy done
      servedFiles [{path: '/first.js', mtime: new Date 12345},
          {path: '/second.js', mtime: new Date 67890}]

      srcFileHandler new httpMock.ServerRequest('/base/other.js'), response, nextSpy
