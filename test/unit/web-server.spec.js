const EventEmitter = require('events').EventEmitter
const request = require('supertest')
const di = require('di')
const mocks = require('mocks')
const fs = require('fs')
const mime = require('mime')
const path = require('path')

describe('web-server', () => {
  let server
  let emitter
  const File = require('../../lib/file')

  const _mocks = {}
  const _globals = { __dirname: '/karma/lib' }

  _mocks['graceful-fs'] = mocks.fs.create({
    karma: {
      static: {
        'client.html': mocks.fs.file(0, 'CLIENT HTML')
      }
    },
    base: {
      path: {
        'one.js': mocks.fs.file(0, 'js-source'),
        'new.js': mocks.fs.file(0, 'new-js-source')
      }
    }
  })

  // NOTE(vojta): only loading once, to speed things up
  // this relies on the fact that none of these tests mutate fs
  const m = mocks.loadFile(path.join(__dirname, '/../../lib/web-server.js'), _mocks, _globals)
  let customFileHandlers = server = emitter = null
  let beforeMiddlewareActive = false
  let middlewareActive = false
  const servedFiles = (files) => {
    emitter.emit('file_list_modified', { included: [], served: files })
  }

  describe('request', () => {
    beforeEach(() => {
      customFileHandlers = []
      emitter = new EventEmitter()
      const config = {
        basePath: '/base/path',
        urlRoot: '/',
        beforeMiddleware: ['beforeCustom'],
        middleware: ['custom'],
        middlewareResponse: 'hello middleware!',
        mime: { 'custom/custom': ['custom'] },
        client: {
          useIframe: true,
          useSingleWindow: false
        }
      }

      const injector = new di.Injector([{
        config: ['value', config],
        customFileHandlers: ['value', customFileHandlers],
        emitter: ['value', emitter],
        fileList: ['value', { files: { served: [], included: [] } }],
        filesPromise: ['factory', m.createFilesPromise],
        serveStaticFile: ['factory', m.createServeStaticFile],
        serveFile: ['factory', m.createServeFile],
        capturedBrowsers: ['value', null],
        reporter: ['value', null],
        executor: ['value', null],
        proxies: ['value', null],
        'middleware:beforeCustom': ['factory', function (config) {
          return function (request, response, next) {
            if (beforeMiddlewareActive) {
              response.writeHead(223)
              return response.end('hello from before middleware!')
            }
            next()
          }
        }],
        'middleware:custom': ['factory', function (config) {
          return function (request, response, next) {
            if (middlewareActive) {
              response.writeHead(222)
              return response.end(config.middlewareResponse)
            }
            next()
          }
        }]
      }])
      server = injector.invoke(m.createWebServer)
    })

    it('should setup mime', () => {
      expect(mime.getType('/my.custom')).to.equal('custom/custom')
    })

    it('should keep default mimes', () => {
      expect(mime.getType('/my.html')).to.equal('text/html')
    })

    it('should serve client.html', () => {
      servedFiles(new Set())

      return request(server)
        .get('/')
        .expect(200, 'CLIENT HTML')
    })

    it('should serve source files', () => {
      servedFiles(new Set([new File('/base/path/one.js')]))

      return request(server)
        .get('/base/one.js')
        .expect(200, 'js-source')
    })

    it('should serve updated source files on file_list_modified', () => {
      servedFiles(new Set([new File('/base/path/one.js')]))
      servedFiles(new Set([new File('/base/path/new.js')]))

      return request(server)
        .get('/base/new.js')
        .expect(200, 'new-js-source')
    })

    describe('beforeMiddleware', () => {
      beforeEach(() => {
        servedFiles(new Set([new File('/base/path/one.js')]))
        beforeMiddlewareActive = true
      })

      afterEach(() => {
        beforeMiddlewareActive = false
      })

      it('should use injected middleware', () => {
        return request(server)
          .get('/base/other.js')
          .expect(223, 'hello from before middleware!')
      })

      it('should inject middleware before served files', () => {
        return request(server)
          .get('/base/one.js')
          .expect(223, 'hello from before middleware!')
      })
    })

    describe('middleware', () => {
      beforeEach(() => {
        servedFiles(new Set([new File('/base/path/one.js')]))
        middlewareActive = true
      })

      afterEach(() => {
        middlewareActive = false
      })

      it('should use injected middleware', () => {
        return request(server)
          .get('/base/other.js')
          .expect(222, 'hello middleware!')
      })

      it('should inject middleware behind served files', () => {
        return request(server)
          .get('/base/one.js')
          .expect(200, 'js-source')
      })
    })

    it('should serve no files when they are not available yet', () => {
      servedFiles(new Set())
      return request(server)
        .get('/base/new.js')
        .expect(404)
        .then(() => {
          servedFiles(new Set([new File('/base/path/new.js')]))

          return request(server)
            .get('/base/new.js')
            .expect(200, 'new-js-source')
        })
    })

    it('should load custom handlers', () => {
      servedFiles(new Set())

      // TODO(vojta): change this, only keeping because karma-dart is relying on it
      customFileHandlers.push({
        urlRegex: /\/some\/weird/,
        handler (request, response, staticFolder, adapterFolder, baseFolder, urlRoot) {
          response.writeHead(222)
          response.end('CONTENT')
        }
      })

      return request(server)
        .get('/some/weird/url')
        .expect(222, 'CONTENT')
    })

    it('should serve 404 for non-existing files', () => {
      servedFiles(new Set())

      return request(server)
        .get('/non/existing.html')
        .expect(404)
    })
  })

  describe('https', () => {
    beforeEach(() => {
      const credentials = {
        key: fs.readFileSync(path.join(__dirname, '/certificates/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '/certificates/server.crt'))
      }

      customFileHandlers = []
      emitter = new EventEmitter()

      const injector = new di.Injector([{
        config: ['value', {
          basePath: '/base/path',
          urlRoot: '/',
          protocol: 'https:',
          httpsServerOptions: credentials,
          client: { useIframe: true, useSingleWindow: false }
        }],
        customFileHandlers: ['value', customFileHandlers],
        emitter: ['value', emitter],
        fileList: ['value', { files: { served: [], included: [] } }],
        filesPromise: ['factory', m.createFilesPromise],
        serveStaticFile: ['factory', m.createServeStaticFile],
        serveFile: ['factory', m.createServeFile],
        capturedBrowsers: ['value', null],
        reporter: ['value', null],
        executor: ['value', null],
        proxies: ['value', null]
      }])

      server = injector.invoke(m.createWebServer)
    })

    it('should be an instance of https.Server', () => {
      expect(server instanceof require('https').Server).to.equal(true)
    })

    it('should serve client.html', () => {
      servedFiles(new Set())

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

      return request(server)
        .get('/')
        .expect(200, 'CLIENT HTML')
    })
  })

  describe('http2', () => {
    const http2 = require('http2/')

    beforeEach(() => {
      const credentials = {
        key: fs.readFileSync(path.join(__dirname, '/certificates/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '/certificates/server.crt'))
      }

      customFileHandlers = []
      emitter = new EventEmitter()

      const injector = new di.Injector([{
        config: ['value', { basePath: '/base/path', urlRoot: '/', httpModule: http2, protocol: 'https:', httpsServerOptions: credentials }],
        customFileHandlers: ['value', customFileHandlers],
        emitter: ['value', emitter],
        fileList: ['value', { files: { served: [], included: [] } }],
        filesPromise: ['factory', m.createFilesPromise],
        serveStaticFile: ['factory', m.createServeStaticFile],
        serveFile: ['factory', m.createServeFile],
        capturedBrowsers: ['value', null],
        reporter: ['value', null],
        executor: ['value', null],
        proxies: ['value', null]
      }])

      server = injector.invoke(m.createWebServer)
    })

    it('should be an instance of httpModule provided in config', () => {
      expect(server instanceof http2.Server).to.equal(true)
    })
  })
})
