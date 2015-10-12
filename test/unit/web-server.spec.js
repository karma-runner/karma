require('core-js')
import {EventEmitter} from 'events'
import request from 'supertest-as-promised'
import di from 'di'
import mocks from 'mocks'
import fs from 'fs'

describe('web-server', () => {
  var server
  var emitter
  var File = require('../../lib/file')

  var _mocks = {}
  var _globals = {__dirname: '/karma/lib'}

  _mocks.fs = mocks.fs.create({
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
  var m = mocks.loadFile(__dirname + '/../../lib/web-server.js', _mocks, _globals)

  var middlewareActivated = false;
  var customFileHandlers = server = emitter = null

  var servedFiles = (files) => {
    emitter.emit('file_list_modified', {included: [], served: files})
  }

  describe('request', () => {
    beforeEach(() => {
      customFileHandlers = []
      emitter = new EventEmitter()
      var config = {
        basePath: '/base/path',
        urlRoot: '/',
        middleware: function(connect) {
          connect.use(function (request, response, next) {
            if(middlewareActivated) {
              response.writeHead(222)
              return response.end('middleware!')
            }
            next()
          })
        }
      }

      var injector = new di.Injector([{
        config: ['value', config],
        customFileHandlers: ['value', customFileHandlers],
        emitter: ['value', emitter],
        fileList: ['value', {files: {served: [], included: []}}],
        capturedBrowsers: ['value', null],
        reporter: ['value', null],
        executor: ['value', null],
        proxies: ['value', null]
      }])

      server = injector.invoke(m.createWebServer)
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

    describe('middleware', function() {
      beforeEach(() =>{
        servedFiles(new Set([new File('/base/path/one.js')]))
        middlewareActivated = true;
      })

      it('should use injected middleware', () => {
        return request(server)
          .get('/base/other.js')
          .expect(222, 'middleware!')
      })

      it('should inject middleware behind served files', () => {
        return request(server)
          .get('/base/one.js')
          .expect(200, 'js-source')
      })
    })

    it('should serve no files when they are not available yet', () => {
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
      var credentials = {
        key: fs.readFileSync(__dirname + '/certificates/server.key'),
        cert: fs.readFileSync(__dirname + '/certificates/server.crt')
      }

      customFileHandlers = []
      emitter = new EventEmitter()

      var injector = new di.Injector([{
        config: ['value', {basePath: '/base/path', urlRoot: '/', protocol: 'https:', httpsServerOptions: credentials}],
        customFileHandlers: ['value', customFileHandlers],
        emitter: ['value', emitter],
        fileList: ['value', {files: {served: [], included: []}}],
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
})
