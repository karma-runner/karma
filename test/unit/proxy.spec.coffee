
describe 'proxy unit tests', ->
  util = require '../test-util'
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile
  actualOptions = null
  # async helper
  waitForFinishingResponse = ->
    waitsFor (-> response._isFinished()), 'Finish response', 100
  mocks = {}

  mocks['http-proxy'] = {}
  globals = process: {}

  m = loadFile __dirname + '/../../lib/proxy.js', mocks, globals

  mockProxy = {}
  mockProxy.proxyRequest = (req, res, opt) ->
    actualOptions = opt
    res.writeHead 200
    res.end 'DONE'
  response = null

  beforeEach ->
    actualOptions = {}
    response = new httpMock.ServerResponse

  it 'should proxy requests', ->
    proxy = m.createProxyHandler(mockProxy, {'/proxy': 'http://localhost:9000'})

    expect(proxy new httpMock.ServerRequest('/proxy/test.html'), response).toBeTruthy()
    waitForFinishingResponse()

    runs ->
      expect(actualOptions).toEqual {host: 'localhost', port: '9000'}

  it 'should support multiple proxies', ->
    proxy = m.createProxyHandler(mockProxy, {'/proxy': 'http://localhost:9000', '/static': 'http://gstatic.com'})
    expect(proxy new httpMock.ServerRequest('/static/test.html'), response).toBeTruthy()
    waitForFinishingResponse()

    runs ->
      expect(actualOptions).toEqual {host: 'gstatic.com', port: '80'}

  it 'should handle nested proxies', ->
    proxy = m.createProxyHandler(mockProxy, {'/sub': 'http://localhost:9000', '/sub/some': 'http://gstatic.com'})
    expect(proxy new httpMock.ServerRequest('/sub/some/Test.html'), response).toBeTruthy()
    waitForFinishingResponse()

    runs ->
      expect(actualOptions).toEqual {host: 'gstatic.com', port: '80'}
