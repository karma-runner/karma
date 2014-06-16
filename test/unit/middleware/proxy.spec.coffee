#==============================================================================
# lib/proxy.js module
#==============================================================================
describe 'middleware.proxy', ->
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  actualOptions = requestedUrl = response = nextSpy = null

  m = loadFile __dirname + '/../../../lib/middleware/proxy.js', {'http-proxy': {}}
  c = require('../../../lib/constants')

  mockProxy =
    on: ->
    proxyRequest: (req, res, opt) ->
      actualOptions = opt
      requestedUrl = req.url
      res.writeHead 200
      res.end 'DONE'

  beforeEach ->
    actualOptions = {}
    requestedUrl = ''
    response = new httpMock.ServerResponse
    nextSpy = sinon.spy()


  it 'should proxy requests', (done) ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000'}, true
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {
      host: 'localhost',
      port: '9000',
      target:{https:false, rejectUnauthorized:true}
      }
    done()

   it 'should enable https', (done) ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'https://localhost:9000'}, true
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {
      host: 'localhost',
      port: '9000',
      target:{https:true, rejectUnauthorized:true}
      }
    done()

   it 'disable ssl validation', (done) ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'https://localhost:9000'}, false
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {
      host: 'localhost',
      port: '9000',
      target:{https:true, rejectUnauthorized:false}
      }
    done()

  it 'should support multiple proxies', ->
    proxy = m.createProxyHandler mockProxy, {
      '/proxy': 'http://localhost:9000'
      '/static': 'http://gstatic.com'
    }, true
    proxy new httpMock.ServerRequest('/static/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {
      host: 'gstatic.com',
      port: '80',
      target:{https:false, rejectUnauthorized:true}
      }

  it 'should handle nested proxies', ->
    proxy = m.createProxyHandler mockProxy, {
      '/sub': 'http://localhost:9000'
      '/sub/some': 'http://gstatic.com/something'
    }, true
    proxy new httpMock.ServerRequest('/sub/some/Test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/something/Test.html'
    expect(actualOptions).to.deep.equal {
      host: 'gstatic.com',
      port: '80',
      target:{https:false, rejectUnauthorized:true}
      }


  it 'should call next handler if the path is not proxied', ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000'}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).to.have.been.called


  it 'should call next handler if no proxy defined', ->
    proxy = m.createProxyHandler mockProxy, {}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).to.have.been.called


  it 'should parse a simple proxy config', ->
    proxy = {'/base/': 'http://localhost:8000/'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base/': {host: 'localhost', port: '8000', baseProxyUrl: '/', https:false}
    }

  it 'should set defualt http port', ->
    proxy = {'/base/': 'http://localhost/'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base/': {host: 'localhost', port: '80', baseProxyUrl: '/', https:false}
    }

  it 'should set defualt https port', ->
    proxy = {'/base/': 'https://localhost/'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base/': {host: 'localhost', port: '443', baseProxyUrl: '/', https:true}
    }


  it 'should handle proxy configs with paths', ->
    proxy = {'/base': 'http://localhost:8000/proxy'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base': {host: 'localhost', port: '8000', baseProxyUrl: '/proxy', https:false}
    }

  it 'should determine protocol', ->
    proxy = {'/base':'https://localhost:8000'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base': {host: 'localhost', port: '8000', baseProxyUrl: '', https: true}
    }

  it 'should handle proxy configs with only basepaths', ->
    proxy = {'/base': '/proxy/test'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base': {host: c.DEFAULT_HOSTNAME, port: c.DEFAULT_PORT,
      baseProxyUrl: '/proxy/test', https:false}
    }

  it 'should normalize proxy url with only basepaths', ->
    proxy = {'/base/': '/proxy/test'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base/': {host: c.DEFAULT_HOSTNAME, port: c.DEFAULT_PORT,
      baseProxyUrl: '/proxy/test/', https:false}
    }

  it 'should normalize proxy url', ->
    proxy = {'/base/': 'http://localhost:8000/proxy/test'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal {
      '/base/': {host: 'localhost', port: '8000', baseProxyUrl: '/proxy/test/', https:false}
    }

  it 'should handle empty proxy config', ->
    expect(m.parseProxyConfig {}).to.deep.equal({})
