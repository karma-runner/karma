var mocks = require('mocks')

var helper = require('../../../lib/helper')
var constants = require('../../../lib/constants')
var File = require('../../../lib/file')
var Url = require('../../../lib/url')

var HttpResponseMock = mocks.http.ServerResponse
var HttpRequestMock = mocks.http.ServerRequest

describe('middleware.karma', () => {
  var serveFile
  var filesDeferred
  var nextSpy
  var response

  var MockFile = function (path, sha, type) {
    File.call(this, path, undefined, undefined, type)
    this.sha = sha || 'sha-default'
  }

  var fsMock = mocks.fs.create({
    karma: {
      static: {
        'client.html': mocks.fs.file(0, 'CLIENT HTML\n%X_UA_COMPATIBLE%%X_UA_COMPATIBLE_URL%'),
        'context.html': mocks.fs.file(0, 'CONTEXT\n%SCRIPTS%'),
        'debug.html': mocks.fs.file(0, 'DEBUG\n%SCRIPTS%\n%X_UA_COMPATIBLE%'),
        'karma.js': mocks.fs.file(0, 'root: %KARMA_URL_ROOT%, proxy: %KARMA_PROXY_PATH%, v: %KARMA_VERSION%')
      }
    }
  })

  var createServeFile = require('../../../lib/middleware/common').createServeFile
  var createKarmaMiddleware = require('../../../lib/middleware/karma').create

  var handler = serveFile = filesDeferred = nextSpy = response = null

  var clientConfig = {
    foo: 'bar'
  }
  var injector = {
    get (val) {
      switch (val) {
        case 'config.client':
          return clientConfig
        case 'config.crossOriginAttribute':
          return true
        default:
          return null
      }
    }
  }

  beforeEach(() => {
    nextSpy = sinon.spy()
    response = new HttpResponseMock()
    filesDeferred = helper.defer()
    serveFile = createServeFile(fsMock, '/karma/static')
    handler = createKarmaMiddleware(
      filesDeferred.promise,
      serveFile,
      null,
      injector,
      '/base/path',
      '/__karma__/',
      {path: '/__proxy__/'}
    )
  })

  // helpers
  var includedFiles = (files) => {
    return filesDeferred.resolve({included: files, served: []})
  }

  var servedFiles = (files) => {
    return filesDeferred.resolve({included: [], served: files})
  }

  var normalizedHttpRequest = (urlPath) => {
    var req = new HttpRequestMock(urlPath)
    req.normalizedUrl = req.url
    return req
  }

  var callHandlerWith = function (urlPath, next) {
    var promise = handler(normalizedHttpRequest(urlPath), response, next || nextSpy)
    if (promise && promise.done) promise.done()
  }

  it('should redirect urlRoot without trailing slash', (done) => {
    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(301, 'MOVED PERMANENTLY')
      expect(response._headers['Location']).to.equal('/__proxy__/__karma__/')
      done()
    })

    callHandlerWith('/__karma__')
  })

  it('should not serve outside of urlRoot', () => {
    handler(normalizedHttpRequest('/'), null, nextSpy)
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler(normalizedHttpRequest('/client.html'), null, nextSpy)
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler(normalizedHttpRequest('/debug.html'), null, nextSpy)
    expect(nextSpy).to.have.been.called
    nextSpy.reset()

    handler(normalizedHttpRequest('/context.html'), null, nextSpy)
    expect(nextSpy).to.have.been.called
  })

  it('should serve client.html', (done) => {
    handler = createKarmaMiddleware(
      null,
      serveFile,
      null,
      injector,
      '/base',
      '/'
    )

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CLIENT HTML')
      done()
    })

    callHandlerWith('/')
  })

  it('should serve /?id=xxx', (done) => {
    handler = createKarmaMiddleware(
      null,
      serveFile,
      null,
      injector,
      '/base',
      '/'
    )

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CLIENT HTML')
      done()
    })

    callHandlerWith('/?id=123')
  })

  it('should serve /?x-ua-compatible with replaced values', (done) => {
    handler = createKarmaMiddleware(
      null,
      serveFile,
      null,
      injector,
      '/base',
      '/'
    )

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CLIENT HTML\n<meta http-equiv="X-UA-Compatible" content="xxx=yyy"/>?x-ua-compatible=xxx%3Dyyy')
      done()
    })

    callHandlerWith('/?x-ua-compatible=xxx%3Dyyy')
  })

  it('should serve debug.html/?x-ua-compatible with replaced values', (done) => {
    includedFiles([])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'DEBUG\n\n<meta http-equiv="X-UA-Compatible" content="xxx=yyy"/>')
      done()
    })

    callHandlerWith('/__karma__/debug.html?x-ua-compatible=xxx%3Dyyy')
  })

  it('should serve karma.js with version and urlRoot variables', (done) => {
    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'root: /__karma__/, proxy: /__proxy__/, v: ' + constants.VERSION)
      expect(response._headers['Content-Type']).to.equal('application/javascript')
      done()
    })

    callHandlerWith('/__karma__/karma.js')
  })

  it('should serve context.html with replaced script tags', (done) => {
    includedFiles([
      new MockFile('/first.js', 'sha123'),
      new MockFile('/second.dart', 'sha456')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CONTEXT\n<script type="text/javascript" src="/__proxy__/__karma__/absolute/first.js?sha123" crossorigin="anonymous"></script>\n<script type="application/dart" src="/__proxy__/__karma__/absolute/second.dart?sha456" crossorigin="anonymous"></script>')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should serve context.html with replaced link tags', (done) => {
    includedFiles([
      new MockFile('/first.css', 'sha007'),
      new MockFile('/second.html', 'sha678'),
      new MockFile('/third', 'sha111', 'css'),
      new MockFile('/fourth', 'sha222', 'html')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CONTEXT\n<link type="text/css" href="/__proxy__/__karma__/absolute/first.css?sha007" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/second.html?sha678" rel="import">\n<link type="text/css" href="/__proxy__/__karma__/absolute/third?sha111" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/fourth?sha222" rel="import">')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should serve context.html with the correct path for the script tags', (done) => {
    includedFiles([
      new MockFile('/some/abc/a.js', 'sha'),
      new MockFile('/base/path/b.js', 'shaaa')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CONTEXT\n<script type="text/javascript" src="/__proxy__/__karma__/absolute/some/abc/a.js?sha" crossorigin="anonymous"></script>\n<script type="text/javascript" src="/__proxy__/__karma__/base/b.js?shaaa" crossorigin="anonymous"></script>')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should serve context.html with the correct path for link tags', (done) => {
    includedFiles([
      new MockFile('/some/abc/a.css', 'sha1'),
      new MockFile('/base/path/b.css', 'sha2'),
      new MockFile('/some/abc/c.html', 'sha3'),
      new MockFile('/base/path/d.html', 'sha4'),
      new MockFile('/some/abc/e', 'sha5', 'css'),
      new MockFile('/base/path/f', 'sha6', 'css'),
      new MockFile('/some/abc/g', 'sha7', 'html'),
      new MockFile('/base/path/h', 'sha8', 'html')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'CONTEXT\n<link type="text/css" href="/__proxy__/__karma__/absolute/some/abc/a.css?sha1" rel="stylesheet">\n<link type="text/css" href="/__proxy__/__karma__/base/b.css?sha2" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/some/abc/c.html?sha3" rel="import">\n<link href="/__proxy__/__karma__/base/d.html?sha4" rel="import">\n<link type="text/css" href="/__proxy__/__karma__/absolute/some/abc/e?sha5" rel="stylesheet">\n<link type="text/css" href="/__proxy__/__karma__/base/f?sha6" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/some/abc/g?sha7" rel="import">\n<link href="/__proxy__/__karma__/base/h?sha8" rel="import">')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should serve context.json with the correct paths for all files', (done) => {
    includedFiles([
      new MockFile('/some/abc/a.css', 'sha1'),
      new MockFile('/base/path/b.css', 'sha2'),
      new MockFile('/some/abc/c.html', 'sha3'),
      new MockFile('/base/path/d.html', 'sha4'),
      new MockFile('/some/abc/e', 'sha5', 'css'),
      new MockFile('/base/path/f', 'sha6', 'css'),
      new MockFile('/some/abc/g', 'sha7', 'html'),
      new MockFile('/base/path/h', 'sha8', 'html')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, JSON.stringify({
        files: [
          '/__proxy__/__karma__/absolute/some/abc/a.css?sha1',
          '/__proxy__/__karma__/base/b.css?sha2',
          '/__proxy__/__karma__/absolute/some/abc/c.html?sha3',
          '/__proxy__/__karma__/base/d.html?sha4',
          '/__proxy__/__karma__/absolute/some/abc/e?sha5',
          '/__proxy__/__karma__/base/f?sha6',
          '/__proxy__/__karma__/absolute/some/abc/g?sha7',
          '/__proxy__/__karma__/base/h?sha8'
        ]
      }))
      done()
    })

    callHandlerWith('/__karma__/context.json')
  })

  it('should not change urls', (done) => {
    includedFiles([
      new Url('http://some.url.com/whatever')
    ])

    response.once('end', () => {
      expect(response).to.beServedAs(200, 'CONTEXT\n<script type="text/javascript" src="http://some.url.com/whatever" crossorigin="anonymous"></script>')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should send non-caching headers for context.html', (done) => {
    var ZERO_DATE = (new Date(0)).toUTCString()

    includedFiles([])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response._headers['Cache-Control']).to.equal('no-cache')
      // idiotic IE8 needs more
      expect(response._headers['Pragma']).to.equal('no-cache')
      expect(response._headers['Expires']).to.equal(ZERO_DATE)
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should inline mappings with all served files', (done) => {
    fsMock._touchFile('/karma/static/context.html', 0, '%MAPPINGS%')
    servedFiles([
      new MockFile('/some/abc/a.js', 'sha_a'),
      new MockFile('/base/path/b.js', 'sha_b'),
      new MockFile('\\windows\\path\\uuu\\c.js', 'sha_c')
    ])

    response.once('end', () => {
      expect(response).to.beServedAs(200, "window.__karma__.files = {\n  '/__proxy__/__karma__/absolute/some/abc/a.js': 'sha_a',\n  '/__proxy__/__karma__/base/b.js': 'sha_b',\n  '/__proxy__/__karma__/absolute\\\\windows\\\\path\\\\uuu\\\\c.js': 'sha_c'\n};\n")
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should escape quotes in mappings with all served files', (done) => {
    fsMock._touchFile('/karma/static/context.html', 0, '%MAPPINGS%')
    servedFiles([
      new MockFile("/some/abc/a'b.js", 'sha_a'),
      new MockFile('/base/path/ba.js', 'sha_b')
    ])

    response.once('end', () => {
      expect(response).to.beServedAs(200, 'window.__karma__.files = {\n  \'/__proxy__/__karma__/absolute/some/abc/a\\\'b.js\': \'sha_a\',\n  \'/__proxy__/__karma__/base/ba.js\': \'sha_b\'\n};\n')
      done()
    })

    callHandlerWith('/__karma__/context.html')
  })

  it('should serve debug.html with replaced script tags without timestamps', (done) => {
    includedFiles([
      new MockFile('/first.js'),
      new MockFile('/base/path/b.js')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'DEBUG\n<script type="text/javascript" src="/__proxy__/__karma__/absolute/first.js" crossorigin="anonymous"></script>\n<script type="text/javascript" src="/__proxy__/__karma__/base/b.js" crossorigin="anonymous"></script>')
      done()
    })

    callHandlerWith('/__karma__/debug.html')
  })

  it('should serve debug.html with replaced link tags without timestamps', (done) => {
    includedFiles([
      new MockFile('/first.css'),
      new MockFile('/base/path/b.css'),
      new MockFile('/second.html'),
      new MockFile('/base/path/d.html'),
      new MockFile('/third', null, 'css'),
      new MockFile('/base/path/f', null, 'css'),
      new MockFile('/fourth', null, 'html'),
      new MockFile('/base/path/g', null, 'html')
    ])

    response.once('end', () => {
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs(200, 'DEBUG\n<link type="text/css" href="/__proxy__/__karma__/absolute/first.css" rel="stylesheet">\n<link type="text/css" href="/__proxy__/__karma__/base/b.css" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/second.html" rel="import">\n<link href="/__proxy__/__karma__/base/d.html" rel="import">\n<link type="text/css" href="/__proxy__/__karma__/absolute/third" rel="stylesheet">\n<link type="text/css" href="/__proxy__/__karma__/base/f" rel="stylesheet">\n<link href="/__proxy__/__karma__/absolute/fourth" rel="import">\n<link href="/__proxy__/__karma__/base/g" rel="import">')
      done()
    })

    callHandlerWith('/__karma__/debug.html')
  })

  it('should inline client config to debug.html', (done) => {
    includedFiles([
      new MockFile('/first.js')
    ])
    fsMock._touchFile('/karma/static/debug.html', 1, '%CLIENT_CONFIG%')

    response.once('end', () => {
      expect(response).to.beServedAs(200, 'window.__karma__.config = {"foo":"bar"};\n')
      done()
    })

    callHandlerWith('/__karma__/debug.html')
  })

  it('should not serve other files even if they are in urlRoot', (done) => {
    includedFiles([])

    callHandlerWith('/__karma__/something/else.js', () => {
      expect(response).to.beNotServed()
      done()
    })
  })

  it('should update handle updated configs', (done) => {
    var i = 0
    handler = createKarmaMiddleware(
      filesDeferred.promise,
      serveFile,
      null,
      {
        get (val) {
          if (val === 'config.client') {
            i++
            if (i === 1) {
              return {foo: 'bar'}
            } else {
              return {foo: 'baz'}
            }
          } else {
            return null
          }
        }
      },
      '/base/path',
      '/__karma__/',
      {path: '/__proxy__/'}
    )

    includedFiles([
      new MockFile('/first.js')
    ])
    fsMock._touchFile('/karma/static/debug.html', 1, '%CLIENT_CONFIG%')

    response.once('end', () => {
      expect(response).to.beServedAs(200, 'window.__karma__.config = {"foo":"bar"};\n')

      response = new HttpResponseMock()
      callHandlerWith('/__karma__/debug.html')
      response.once('end', () => {
        expect(response).to.beServedAs(200, 'window.__karma__.config = {"foo":"baz"};\n')
        done()
      })
    })

    callHandlerWith('/__karma__/debug.html')
  })
})
