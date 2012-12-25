#==============================================================================
# lib/proxy.js module
#==============================================================================
describe 'proxy', ->
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  actualOptions = requestedUrl = response = nextSpy = null

  m = loadFile __dirname + '/../../lib/proxy.js', {'http-proxy': {}}

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
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000'}
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {host: 'localhost', port: '9000'}
    done()

  it 'should support multiple proxies', ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000', '/static': 'http://gstatic.com'}
    proxy new httpMock.ServerRequest('/static/test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/test.html'
    expect(actualOptions).to.deep.equal {host: 'gstatic.com', port: '80'}


  it 'should handle nested proxies', ->
    proxy = m.createProxyHandler mockProxy, {'/sub': 'http://localhost:9000', '/sub/some': 'http://gstatic.com/something'}
    proxy new httpMock.ServerRequest('/sub/some/Test.html'), response, nextSpy

    expect(nextSpy).not.to.have.been.called
    expect(requestedUrl).to.equal '/something/Test.html'
    expect(actualOptions).to.deep.equal {host: 'gstatic.com', port: '80'}


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
    expect(parsedProxyConfig).to.deep.equal({'/base/': {host: 'localhost', port: '8000', baseProxyUrl: '/'}})


  it 'should handle proxy configs with paths', ->
    proxy = {'/base': 'http://localhost:8000/proxy'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).to.deep.equal({'/base': {host: 'localhost', port: '8000', baseProxyUrl: '/proxy'}})


  it 'should handle empty proxy config', ->
    expect(m.parseProxyConfig {}).to.deep.equal({})
