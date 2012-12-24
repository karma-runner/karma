
describe 'proxy', ->
  util = require '../test-util'
  fsMock = require('mocks').fs
  httpMock = require('mocks').http
  loadFile = require('mocks').loadFile

  actualOptions = requestedUrl = response = nextSpy = null

  # async helper
  waitForFinishingResponse = ->
    waitsFor (-> response._isFinished()), 'Finish response', 100

  m = loadFile __dirname + '/../../lib/proxy.js', {'http-proxy': {}}

  mockProxy =
    on: ->
    proxyRequest: (req, res, opt) ->
      actualOptions = opt
      requestedUrl = req.url
      res.writeHead 200
      res.end 'DONE'

  beforeEach util.disableLogger

  beforeEach ->
    actualOptions = {}
    requestedUrl = ''
    response = new httpMock.ServerResponse
    nextSpy = jasmine.createSpy 'next handler'


  it 'should proxy requests', ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000'}
    proxy new httpMock.ServerRequest('/proxy/test.html'), response, nextSpy

    waitForFinishingResponse()
    runs ->
      expect(nextSpy).not.toHaveBeenCalled()
      expect(requestedUrl).toEqual '/test.html'
      expect(actualOptions).toEqual {host: 'localhost', port: '9000'}


  it 'should support multiple proxies', ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000', '/static': 'http://gstatic.com'}
    proxy new httpMock.ServerRequest('/static/test.html'), response, nextSpy

    waitForFinishingResponse()
    runs ->
      expect(nextSpy).not.toHaveBeenCalled()
      expect(requestedUrl).toEqual '/test.html'
      expect(actualOptions).toEqual {host: 'gstatic.com', port: '80'}


  it 'should handle nested proxies', ->
    proxy = m.createProxyHandler mockProxy, {'/sub': 'http://localhost:9000', '/sub/some': 'http://gstatic.com/something'}
    proxy new httpMock.ServerRequest('/sub/some/Test.html'), response, nextSpy

    waitForFinishingResponse()
    runs ->
      expect(nextSpy).not.toHaveBeenCalled()
      expect(requestedUrl).toEqual '/something/Test.html'
      expect(actualOptions).toEqual {host: 'gstatic.com', port: '80'}


  it 'should call next handler if the path is not proxied', ->
    proxy = m.createProxyHandler mockProxy, {'/proxy': 'http://localhost:9000'}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).toHaveBeenCalled()


  it 'should call next handler if no proxy defined', ->
    proxy = m.createProxyHandler mockProxy, {}
    proxy new httpMock.ServerRequest('/non/proxy/test.html'), response, nextSpy

    expect(nextSpy).toHaveBeenCalled()


  it 'should parse a simple proxy config', ->
    proxy = {'/base/': 'http://localhost:8000/'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).toEqual({'/base/': {host: 'localhost', port: '8000', baseProxyUrl: '/'}})


  it 'should handle proxy configs with paths', ->
    proxy = {'/base': 'http://localhost:8000/proxy'}
    parsedProxyConfig = m.parseProxyConfig proxy
    expect(parsedProxyConfig).toEqual({'/base': {host: 'localhost', port: '8000', baseProxyUrl: '/proxy'}})


  it 'should handle empty proxy config', ->
    expect(m.parseProxyConfig {}).toEqual({})
