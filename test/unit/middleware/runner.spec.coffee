describe 'middleware.runner', ->

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  EventEmitter = require('events').EventEmitter
  Browser = require('../../../lib/browser').Browser
  BrowserCollection = require('../../../lib/browser').Collection
  MultReporter = require('../../../lib/reporters/Multi')
  createRunnerMiddleware = require('../../../lib/middleware/runner').create

  handler = nextSpy = response = mockReporter = capturedBrowsers = emitter = config = null

  beforeEach ->
    mockReporter =
      adapters: []
      write: (msg) -> @adapters.forEach (adapter) -> adapter msg

    emitter = new EventEmitter
    capturedBrowsers = new BrowserCollection emitter
    fileListMock =
      refresh: -> emitter.emit 'run_start'
    nextSpy = sinon.spy()
    response = new HttpResponseMock
    config = {client: {}}

    handler = createRunnerMiddleware emitter, fileListMock, capturedBrowsers,
        new MultReporter([mockReporter]), 'localhost', 8877, '/', config


  it 'should trigger test run and stream the reporter', (done) ->
    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true

    response.once 'end', ->
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs 200, 'result\x1FEXIT0'
      done()

    handler new HttpRequestMock('/__run__'), response, nextSpy

    mockReporter.write 'result'
    emitter.emit 'run_complete', capturedBrowsers, {exitCode: 0}


  it 'should not run if there is no browser captured', (done) ->
    response.once 'end', ->
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs 200, 'No captured browser, open http://localhost:8877/\n'
      done()

    handler new HttpRequestMock('/__run__'), response, nextSpy


  it 'should parse body and set client.args', (done) ->
    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true

    emitter.once 'run_start', ->
      expect(config.client.args).to.deep.equal ['arg1', 'arg2']
      done()

    request = new HttpRequestMock '/__run__', {
      'content-type': 'application/json'
      'content-length': 1
    }
    request.setEncoding = -> null

    handler request, response, nextSpy

    request.emit 'data', '{"args": ["arg1", "arg2"]}'
    request.emit 'end'


  it 'should ignore other urls', (done) ->
    handler new HttpRequestMock('/something'), response, ->
      expect(response).to.beNotServed()
      done()
