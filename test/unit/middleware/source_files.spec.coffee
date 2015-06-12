http = require 'http'
q = require 'q'
mocks = require 'mocks'
request = require 'supertest-as-promised'

File = require('../../../lib/file_list').File
Url = require('../../../lib/file_list').Url
createServeFile = require('../../../lib/middleware/common').createServeFile
createSourceFilesMiddleware = require('../../../lib/middleware/source_files').create

describe 'middleware.source_files', ->
  server = next = files = null

  fsMock = mocks.fs.create
    base:
      path:
        'a.js': mocks.fs.file(0, 'js-src-a')
        'index.html': mocks.fs.file(0, '<html>')
    src:
      'some.js': mocks.fs.file(0, 'js-source')
    'utf8ášč':
      'some.js': mocks.fs.file(0, 'utf8-file')

  serveFile = createServeFile fsMock, null

  createServer = (f, s, basePath) ->
    handler = createSourceFilesMiddleware f.promise, s, basePath
    http.createServer (req, res) ->
      next = sinon.spy (err) ->
        if err
          res.statusCode = err.status || 500
          res.end err.message
        else
          res.statusCode = 200
          res.end JSON.stringify(req.body)

      handler req, res, next

  beforeEach ->
    files = q.defer()
    server = createServer files, serveFile, '/base/path'

  afterEach ->
    next.reset()

  # helpers
  includedFiles = (list) ->
    files.resolve {included: list, served: []}

  servedFiles = (list) ->
    files.resolve {included: [], served: list}

  it 'should serve absolute js source files ignoring timestamp', () ->
    servedFiles [
      new File('/src/some.js')
    ]

    request(server)
    .get('/absolute/src/some.js?123345')
    .expect(200, 'js-source')

  it 'should serve js source files from base folder ignoring timestamp', () ->
    servedFiles [
      new File('/base/path/a.js')
    ]

    request(server)
    .get('/base/a.js?123345')
    .expect(200, 'js-src-a')
    .then(() ->
      expect(next).not.to.have.been.called
    )

  it 'should send strict caching headers for js source files with sha', () ->
    servedFiles [
      new File('/src/some.js')
    ]

    request(server)
    .get('/absolute/src/some.js?df43b8acf136389a8dd989bda397d1c9b4e048be')
    .expect('Cache-Control', 'public, max-age=31536000')
    .expect(200)
    .then(() ->
      expect(next).not.to.have.been.called
    )

  it 'should send strict caching headers for js source files with sha (in basePath)', () ->
    servedFiles [
      new File('/base/path/a.js')
    ]

    request(server)
    .get('/base/a.js?df43b8acf136389a8dd989bda397d1c9b4e048be')
    .expect('Cache-Control', 'public, max-age=31536000')
    .expect(200)

  it 'should send no-caching headers for js source files without timestamps', () ->
    ZERO_DATE = (new Date 0).toString()

    servedFiles [
      new File('/src/some.js')
    ]

    request(server)
    .get('/absolute/src/some.js')
    .expect('Cache-Control', 'no-cache')
    # idiotic IE8 needs more
    .expect('Pragma', 'no-cache')
    .expect('Expires', ZERO_DATE)
    .expect(200)
    .then(() ->
      expect(next).not.to.have.been.called
    )

  it 'should not serve files that are not in served', () ->
    servedFiles []

    request(server)
    .get('/absolute/non-existing.html')
    .expect(200, '')

  it 'should serve 404 if file is served but does not exist', () ->
    servedFiles [
      new File('/non-existing.js')
    ]

    request(server)
    .get('/absolute/non-existing.js')
    .expect(404, 'NOT FOUND')


  it 'should serve js source file from base path containing utf8 chars', () ->
    servedFiles [
      new File('/utf8ášč/some.js')
    ]

    server = createServer files, serveFile, '/utf8ášč'

    request(server)
    .get('/base/some.js')
    .expect(200, 'utf8-file')
    .then(() ->
      expect(next).not.to.have.been.called
    )

  it 'should set content-type headers', () ->
    servedFiles [
      new File('/base/path/index.html')
    ]

    request(server)
    .get('/base/index.html')
    .expect('Content-Type', 'text/html')
    .expect(200)

  it 'should use cached content if available', () ->
    cachedFile = new File('/some/file.js')
    cachedFile.content = 'cached-content'

    servedFiles [
      cachedFile
    ]

    request(server)
    .get('/absolute/some/file.js')
    .expect(200, 'cached-content')
    .then(() ->
      expect(next).not.to.have.been.called
    )

  it 'should not use cached content if doNotCache is set', () ->
    cachedFile = new File('/src/some.js')
    cachedFile.content = 'cached-content'
    cachedFile.doNotCache = true

    servedFiles [
      cachedFile
    ]

    request(server)
    .get('/absolute/src/some.js')
    .expect(200, 'js-source')
    .then(() ->
      expect(next).not.to.have.been.called
    )
