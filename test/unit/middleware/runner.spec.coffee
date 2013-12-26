describe 'middleware.runner', ->

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  EventEmitter = require('events').EventEmitter
  Browser = require '../../../lib/browser'
  BrowserCollection = require '../../../lib/browser_collection'
  MultReporter = require('../../../lib/reporters/multi')
  createRunnerMiddleware = require('../../../lib/middleware/runner').create

  handler = nextSpy = response = mockReporter = capturedBrowsers = emitter = config = null
  fileListMock = executor = null

  beforeEach ->
    mockReporter =
      adapters: []
      write: (msg) -> @adapters.forEach (adapter) -> adapter msg

    executor =
      schedule: -> emitter.emit 'run_start'

    emitter = new EventEmitter
    capturedBrowsers = new BrowserCollection emitter
    fileListMock =
      refresh: -> null
      addFile: -> null
      removeFile: -> null
      changeFile: -> null

    nextSpy = sinon.spy()
    response = new HttpResponseMock
    config = {client: {}}

    handler = createRunnerMiddleware emitter, fileListMock, capturedBrowsers,
        new MultReporter([mockReporter]), executor, 'localhost', 8877, '/', config


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
    sinon.stub fileListMock, 'refresh'

    response.once 'end', ->
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs 200, 'No captured browser, open http://localhost:8877/\n'
      expect(fileListMock.refresh).not.to.have.been.called
      done()

    handler new HttpRequestMock('/__run__'), response, nextSpy


  it 'should parse body and set client.args', (done) ->
    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true

    emitter.once 'run_start', ->
      expect(config.client.args).to.deep.equal ['arg1', 'arg2']
      done()

    RAW_MESSAGE = '{"args": ["arg1", "arg2"]}'

    request = new HttpRequestMock '/__run__', {
      'content-type': 'application/json'
      'content-length': RAW_MESSAGE.length
    }

    handler request, response, nextSpy

    request.emit 'data', RAW_MESSAGE
    request.emit 'end'


  it 'should refresh explicit files if specified', (done) ->
    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true
    sinon.stub fileListMock, 'refresh'
    sinon.stub fileListMock, 'addFile'
    sinon.stub fileListMock, 'changeFile'
    sinon.stub fileListMock, 'removeFile'

    RAW_MESSAGE = JSON.stringify
      addedFiles: ['/new.js']
      removedFiles: ['/foo.js', '/bar.js']
      changedFiles: ['/changed.js']

    request = new HttpRequestMock '/__run__', {
      'content-type': 'application/json'
      'content-length': RAW_MESSAGE.length
    }

    handler request, response, nextSpy

    request.emit 'data', RAW_MESSAGE
    request.emit 'end'

    process.nextTick ->
      expect(fileListMock.refresh).not.to.have.been.called
      expect(fileListMock.addFile).to.have.been.calledWith '/new.js'
      expect(fileListMock.removeFile).to.have.been.calledWith '/foo.js'
      expect(fileListMock.removeFile).to.have.been.calledWith '/bar.js'
      expect(fileListMock.changeFile).to.have.been.calledWith '/changed.js'
      done()

  it 'should schedule execution if no refresh', (done) ->
    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true

    sinon.stub fileListMock, 'refresh'
    sinon.stub executor, 'schedule'

    RAW_MESSAGE = JSON.stringify {refresh: false}

    request = new HttpRequestMock '/__run__', {
      'content-type': 'application/json'
      'content-length': RAW_MESSAGE.length
    }

    handler request, response, nextSpy

    request.emit 'data', RAW_MESSAGE
    request.emit 'end'

    process.nextTick ->
      expect(fileListMock.refresh).not.to.have.been.called
      expect(executor.schedule).to.have.been.called
      done()


  it 'should not schedule execution if refreshing and autoWatch', (done) ->
    config.autoWatch = true

    capturedBrowsers.add new Browser
    sinon.stub capturedBrowsers, 'areAllReady', -> true

    sinon.stub fileListMock, 'refresh'
    sinon.stub executor, 'schedule'

    handler new HttpRequestMock('/__run__'), response, nextSpy

    process.nextTick ->
      expect(fileListMock.refresh).to.have.been.called
      expect(executor.schedule).not.to.have.been.called
      done()


  it 'should ignore other urls', (done) ->
    handler new HttpRequestMock('/something'), response, ->
      expect(response).to.beNotServed()
      done()
