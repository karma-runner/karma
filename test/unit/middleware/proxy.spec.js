var path = require('path')
var httpMock = require('mocks').http
var loadFile = require('mocks').loadFile

describe('middleware.proxy', () => {
  var requestedUrl
  var response
  var nextSpy
  var type

  var m = loadFile(path.join(__dirname, '/../../../lib/middleware/proxy.js'))

  var mockProxies = [{
    path: '/proxy',
    baseUrl: '',
    host: 'localhost',
    port: '9000',
    proxy: {
      web: function (req, res) {
        type = 'web'
        requestedUrl = req.url
        res.writeHead(200)
        res.end('DONE')
      },
      ws: function (req, socket, head) {
        type = 'ws'
        requestedUrl = req.url
      }
    }
  }, {
    path: '/static',
    baseUrl: '',
    host: 'gstatic.com',
    port: '80',
    proxy: {
      web: function (req, res) {
        type = 'web'
        requestedUrl = req.url
        res.writeHead(200)
        res.end('DONE')
      },
      ws: function (req, socket, head) {
        type = 'ws'
        requestedUrl = req.url
      }
    }
  }, {
    path: '/sub/some',
    baseUrl: '/something',
    host: 'gstatic.com',
    port: '80',
    proxy: {
      web: function (req, res) {
        type = 'web'
        requestedUrl = req.url
        res.writeHead(200)
        res.end('DONE')
      },
      ws: function (req, socket, head) {
        type = 'ws'
        requestedUrl = req.url
      }
    }
  }, {
    path: '/sub',
    baseUrl: '',
    host: 'localhost',
    port: '9000',
    proxy: {
      web: function (req, res) {
        type = 'web'
        requestedUrl = req.url
        res.writeHead(200)
        res.end('DONE')
      },
      ws: function (req, socket, head) {
        type = 'ws'
        requestedUrl = req.url
      }
    }
  }]

  beforeEach(() => {
    requestedUrl = ''
    type = ''
    response = new httpMock.ServerResponse()
    nextSpy = sinon.spy()
  })

  it('should proxy requests', (done) => {
    var proxy = m.createProxyHandler(mockProxies, true, '/', {})
    proxy(new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy)

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal('/test.html')
    expect(type).to.equal('web')
    done()
  })

  it('should proxy websocket requests', (done) => {
    var proxy = m.createProxyHandler(mockProxies, true, '/', {})
    proxy.upgrade(new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy)

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal('/test.html')
    expect(type).to.equal('ws')
    done()
  })

  it('should support multiple proxies', () => {
    var proxy = m.createProxyHandler(mockProxies, true, '/', {})
    proxy(new httpMock.ServerRequest('/static/test.html'), response, nextSpy)

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal('/test.html')
    expect(type).to.equal('web')
  })

  it('should handle nested proxies', () => {
    var proxy = m.createProxyHandler(mockProxies, true, '/', {})
    proxy(new httpMock.ServerRequest('/sub/some/Test.html'), response, nextSpy)

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal('/something/Test.html')
    expect(type).to.equal('web')
  })

  it('should call next handler if the path is not proxied', () => {
    var proxy = m.createProxyHandler(mockProxies, true, '/', {})
    proxy(new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy)

    expect(nextSpy).to.have.been.called
  })

  it('should call next handler if no proxy defined', () => {
    var proxy = m.createProxyHandler({}, true, '/', {})
    proxy(new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy)

    expect(nextSpy).to.have.been.called
  })

  it('should parse a simple proxy config', () => {
    var proxy = {'/base/': 'http://localhost:8000/'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '8000',
      baseUrl: '/',
      path: '/base/',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should set default http port', () => {
    var proxy = {'/base/': 'http://localhost/'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '80',
      baseUrl: '/',
      path: '/base/',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should set default https port', () => {
    var proxy = {'/base/': 'https://localhost/'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '443',
      baseUrl: '/',
      path: '/base/',
      https: true
    })
    expect(parsedProxyConfig[0].proxy).to.exist
    expect(parsedProxyConfig[0].proxy).to.containSubset({
      options: {
        target: {
          protocol: 'https:'
        }
      }
    })
  })

  it('should handle proxy configs with paths', () => {
    var proxy = {'/base': 'http://localhost:8000/proxy'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '8000',
      baseUrl: '/proxy',
      path: '/base',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should determine protocol', () => {
    var proxy = {'/base': 'https://localhost:8000'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '8000',
      baseUrl: '',
      path: '/base',
      https: true
    })
    expect(parsedProxyConfig[0].proxy).to.exist
    expect(parsedProxyConfig[0].proxy).to.containSubset({
      options: {
        target: {
          protocol: 'https:'
        }
      }
    })
  })

  it('should handle proxy configs with only basepaths', () => {
    var proxy = {'/base': '/proxy/test'}
    var config = {port: 9877, hostname: 'localhost'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, config)
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: 9877,
      baseUrl: '/proxy/test',
      path: '/base',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should normalize proxy url with only basepaths', () => {
    var proxy = {'/base/': '/proxy/test'}
    var config = {port: 9877, hostname: 'localhost'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, config)
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: 9877,
      baseUrl: '/proxy/test/',
      path: '/base/',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should parse right port of proxy target', () => {
    var proxy = { '/w': 'http://krinkle.dev/w' }
    var config = {port: 9877, hostname: 'localhost'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, config)
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'krinkle.dev',
      port: '80',
      baseUrl: '/w',
      path: '/w',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should parse right port of proxy target w. https', () => {
    var proxy = { '/w': 'https://krinkle.dev/w' }
    var config = {port: 9877, hostname: 'localhost'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, config)
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'krinkle.dev',
      port: '443',
      baseUrl: '/w',
      path: '/w',
      https: true
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should normalize proxy url', () => {
    var proxy = {'/base/': 'http://localhost:8000/proxy/test'}
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '8000',
      baseUrl: '/proxy/test/',
      path: '/base/',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should parse nested proxy config', () => {
    var proxy = {
      '/sub': 'http://localhost:9000',
      '/sub/some': 'http://gstatic.com/something'
    }
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(2)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'gstatic.com',
      port: '80',
      baseUrl: '/something',
      path: '/sub/some',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
    expect(parsedProxyConfig[1]).to.containSubset({
      host: 'localhost',
      port: '9000',
      baseUrl: '',
      path: '/sub',
      https: false
    })
    expect(parsedProxyConfig[1].proxy).to.exist
  })

  it('should accept object for proxy config', () => {
    var proxy = {
      '/base/': {target: 'http://localhost:8000/'}
    }
    var parsedProxyConfig = m.parseProxyConfig(proxy, {})
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0]).to.containSubset({
      host: 'localhost',
      port: '8000',
      baseUrl: '/',
      path: '/base/',
      https: false
    })
    expect(parsedProxyConfig[0].proxy).to.exist
  })

  it('should bind proxy event', () => {
    var proxy = {'/base/': 'http://localhost:8000/'}
    var config = {
      proxyReq: function proxyReq () {},
      proxyRes: function proxyRes () {}
    }
    var parsedProxyConfig = m.parseProxyConfig(proxy, config)
    expect(parsedProxyConfig).to.have.length(1)
    expect(parsedProxyConfig[0].proxy.listeners('proxyReq', true)).to.equal(true)
    expect(parsedProxyConfig[0].proxy.listeners('proxyRes', true)).to.equal(true)
  })

  it('should handle empty proxy config', () => {
    expect(m.parseProxyConfig({})).to.deep.equal([])
  })
})
