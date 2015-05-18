#==============================================================================
# lib/proxy.js module
#==============================================================================
describe 'middleware.proxy', ->
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  actualOptions = requestedUrl = response = nextSpy = type = null

  m = loadFile __dirname + '/../../../lib/middleware/proxy.js'

  mockProxies = [{
    path: '/proxy',
    baseUrl: '',
    host: 'localhost',
    port: '9000',
    proxy: {
      web: (req, res) ->
        type = 'web'
        requestedUrl = req.url
        res.writeHead 200
        res.end 'DONE'
      ws: (req, socket, head) ->
        type = 'ws'
        requestedUrl = req.url
    }
  }, {
    path: '/static',
    baseUrl: '',
    host: 'gstatic.com',
    port: '80',
    proxy: {
      web: (req, res) ->
        type = 'web'
        requestedUrl = req.url
        res.writeHead 200
        res.end 'DONE'
      ws: (req, socket, head) ->
        type = 'ws'
        requestedUrl = req.url
    }
  }, {
    path: '/sub/some',
    baseUrl: '/something',
    host: 'gstatic.com',
    port: '80',
    proxy: {
      web: (req, res) ->
        type = 'web'
        requestedUrl = req.url
        res.writeHead 200
        res.end 'DONE'
      ws: (req, socket, head) ->
        type = 'ws'
        requestedUrl = req.url
    }
  }, {
    path: '/sub',
    baseUrl: '',
    host: 'localhost',
    port: '9000',
    proxy: {
      web: (req, res) ->
        type = 'web'
        requestedUrl = req.url
        res.writeHead 200
        res.end 'DONE'
      ws: (req, socket, head) ->
        type = 'ws'
        requestedUrl = req.url
    }
  }]

  beforeEach ->
    actualOptions = {}
    requestedUrl = ''
    type = ''
    response = new httpMock.ServerResponse
    nextSpy = sinon.spy()


  it 'should proxy requests', (done) ->
    proxy = m.createProxyHandler mockProxies, true, '/', {}
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(type).to.equal 'web'
    done()

  it 'should proxy websocket requests', (done) ->
    proxy = m.createProxyHandler mockProxies, true, '/', {}
    proxy.upgrade new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(type).to.equal 'ws'
    done()

  it 'should support multiple proxies', ->
    proxy = m.createProxyHandler mockProxies, true, '/', {}
    proxy new httpMock.ServerRequest('/static/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(type).to.equal 'web'

  it 'should handle nested proxies', ->
    proxy = m.createProxyHandler mockProxies, true, '/', {}
    proxy new httpMock.ServerRequest('/sub/some/Test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/something/Test.html'
    expect(type).to.equal 'web'


  it 'should call next handler if the path is not proxied', ->
    proxy = m.createProxyHandler mockProxies, true, '/', {}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).to.have.been.called


  it 'should call next handler if no proxy defined', ->
    proxy = m.createProxyHandler {}, true, '/', {}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).to.have.been.called


  it 'should parse a simple proxy config', ->
    proxy = {'/base/': 'http://localhost:8000/'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '8000',
      baseUrl: '/',
      path: '/base/',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should set defualt http port', ->
    proxy = {'/base/': 'http://localhost/'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '80',
      baseUrl: '/',
      path: '/base/',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should set defualt https port', ->
    proxy = {'/base/': 'https://localhost/'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '443',
      baseUrl: '/',
      path: '/base/',
      https: true
    }
    expect(parsedProxyConfig[0].proxy).to.exist


  it 'should handle proxy configs with paths', ->
    proxy = {'/base': 'http://localhost:8000/proxy'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '8000',
      baseUrl: '/proxy',
      path: '/base',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should determine protocol', ->
    proxy = {'/base':'https://localhost:8000'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '8000',
      baseUrl: '',
      path: '/base',
      https: true
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should handle proxy configs with only basepaths', ->
    proxy = {'/base': '/proxy/test'}
    config = {port: 9877, hostname: 'localhost'}
    parsedProxyConfig = m.parseProxyConfig proxy, config
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: 9877,
      baseUrl: '/proxy/test',
      path: '/base',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should normalize proxy url with only basepaths', ->
    proxy = {'/base/': '/proxy/test'}
    config = {port: 9877, hostname: 'localhost'}
    parsedProxyConfig = m.parseProxyConfig proxy, config
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: 9877,
      baseUrl: '/proxy/test/',
      path: '/base/',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should normalize proxy url', ->
    proxy = {'/base/': 'http://localhost:8000/proxy/test'}
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 1
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'localhost',
      port: '8000',
      baseUrl: '/proxy/test/',
      path: '/base/',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist

  it 'should parse nested proxy config', ->
    proxy = {
      '/sub': 'http://localhost:9000'
      '/sub/some': 'http://gstatic.com/something'
    }
    parsedProxyConfig = m.parseProxyConfig proxy, {}
    expect(parsedProxyConfig).to.have.length 2
    expect(parsedProxyConfig[0]).to.containSubset {
      host: 'gstatic.com',
      port: '80',
      baseUrl: '/something',
      path: '/sub/some',
      https: false
    }
    expect(parsedProxyConfig[0].proxy).to.exist
    expect(parsedProxyConfig[1]).to.containSubset {
      host: 'localhost',
      port: '9000',
      baseUrl: '',
      path: '/sub',
      https: false
    }
    expect(parsedProxyConfig[1].proxy).to.exist

  it 'should handle empty proxy config', ->
    expect(m.parseProxyConfig {}).to.deep.equal([])
