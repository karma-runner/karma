import path from 'path'
import {EventEmitter} from 'events'
import mocks from 'mocks'
import {Promise} from 'bluebird'
import Browser from '../../../lib/browser'
import BrowserCollection from '../../../lib/browser_collection'
import MultReporter from '../../../lib/reporters/multi'
var createRunnerMiddleware = require('../../../lib/middleware/runner').create
var HttpResponseMock = mocks.http.ServerResponse
var HttpRequestMock = mocks.http.ServerRequest

describe('middleware.runner', () => {
  var nextSpy
  var response
  var mockReporter
  var capturedBrowsers
  var emitter
  var config
  var executor
  var handler
  var fileListMock

  before(() => {
    Promise.setScheduler((fn) => fn())
  })

  after(() => {
    Promise.setScheduler((fn) => process.nextTick(fn))
  })

  beforeEach(() => {
    mockReporter = {
      adapters: [],
      write (msg) {
        return this.adapters.forEach((adapter) => adapter(msg))
      }
    }

    executor = {
      schedule: () => emitter.emit('run_start')
    }

    emitter = new EventEmitter()
    capturedBrowsers = new BrowserCollection(emitter)
    fileListMock = {
      refresh: () => Promise.resolve(),
      addFile: () => null,
      removeFile: () => null,
      changeFile: () => null
    }

    nextSpy = sinon.spy()
    response = new HttpResponseMock()
    config = {client: {}, basePath: '/'}

    handler = createRunnerMiddleware(
      emitter,
      fileListMock,
      capturedBrowsers,
      new MultReporter([mockReporter]),
      executor,
      'http:',
      'localhost',
      8877,
      '/',
      config
    )
  })

  it('should trigger test run and stream the reporter', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    response.once('end', () => {
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs(200, 'result\x1FEXIT10')
      done()
    })

    handler(new HttpRequestMock('/__run__'), response, nextSpy)

    mockReporter.write('result')
    emitter.emit('run_complete', capturedBrowsers, {exitCode: 0})
  })

  it('should set the empty to 0 if empty results', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    response.once('end', () => {
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs(200, 'result\x1FEXIT00')
      done()
    })

    handler(new HttpRequestMock('/__run__'), response, nextSpy)

    mockReporter.write('result')
    emitter.emit('run_complete', capturedBrowsers, {exitCode: 0, success: 0, failed: 0})
  })

  it('should set the empty to 1 if successful tests', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    response.once('end', () => {
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs(200, 'result\x1FEXIT10')
      done()
    })

    handler(new HttpRequestMock('/__run__'), response, nextSpy)

    mockReporter.write('result')
    emitter.emit('run_complete', capturedBrowsers, {exitCode: 0, success: 3, failed: 0})
  })

  it('should set the empty to 1 if failed tests', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    response.once('end', () => {
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs(200, 'result\x1FEXIT10')
      done()
    })

    handler(new HttpRequestMock('/__run__'), response, nextSpy)

    mockReporter.write('result')
    emitter.emit('run_complete', capturedBrowsers, {exitCode: 0, success: 0, failed: 6})
  })

  it('should not run if there is no browser captured', (done) => {
    sinon.stub(fileListMock, 'refresh')

    response.once('end', () => {
      expect(nextSpy).to.not.have.been.called
      expect(response).to.beServedAs(200, 'No captured browser, open http://localhost:8877/\n')
      expect(fileListMock.refresh).not.to.have.been.called
      done()
    })

    handler(new HttpRequestMock('/__run__'), response, nextSpy)
  })

  it('should parse body and set client.args', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    emitter.once('run_start', () => {
      expect(config.client.args).to.deep.equal(['arg1', 'arg2'])
      done()
    })

    var RAW_MESSAGE = '{"args": ["arg1", "arg2"]}'

    var request = new HttpRequestMock('/__run__', {
      'content-type': 'application/json',
      'content-length': RAW_MESSAGE.length
    })

    handler(request, response, nextSpy)

    request.emit('data', RAW_MESSAGE)
    request.emit('end')
  })

  it('should refresh explicit files if specified', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)
    sinon.stub(fileListMock, 'refresh')
    sinon.stub(fileListMock, 'addFile')
    sinon.stub(fileListMock, 'changeFile')
    sinon.stub(fileListMock, 'removeFile')

    var RAW_MESSAGE = JSON.stringify({
      addedFiles: ['/new.js'],
      removedFiles: ['/foo.js', '/bar.js'],
      changedFiles: ['/changed.js']
    })

    var request = new HttpRequestMock('/__run__', {
      'content-type': 'application/json',
      'content-length': RAW_MESSAGE.length
    })

    handler(request, response, nextSpy)

    request.emit('data', RAW_MESSAGE)
    request.emit('end')

    process.nextTick(() => {
      expect(fileListMock.refresh).not.to.have.been.called
      expect(fileListMock.addFile).to.have.been.calledWith(path.resolve('/new.js'))
      expect(fileListMock.removeFile).to.have.been.calledWith(path.resolve('/foo.js'))
      expect(fileListMock.removeFile).to.have.been.calledWith(path.resolve('/bar.js'))
      expect(fileListMock.changeFile).to.have.been.calledWith(path.resolve('/changed.js'))
      done()
    })
  })

  it('should wait for refresh to finish if applicable before scheduling execution', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    var res = null
    var fileListPromise = new Promise((resolve, reject) => {
      res = resolve
    })
    sinon.stub(fileListMock, 'refresh').returns(fileListPromise)
    sinon.stub(executor, 'schedule')

    var request = new HttpRequestMock('/__run__')
    handler(request, response, nextSpy)

    process.nextTick(() => {
      expect(fileListMock.refresh).to.have.been.called
      expect(executor.schedule).to.not.have.been.called

      // Now try resolving the promise
      res()
      setTimeout(() => {
        expect(executor.schedule).to.have.been.called
        done()
      }, 2)
    })
  })

  it('should schedule execution if no refresh', (done) => {
    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    sinon.spy(fileListMock, 'refresh')
    sinon.stub(executor, 'schedule')

    var RAW_MESSAGE = JSON.stringify({refresh: false})

    var request = new HttpRequestMock('/__run__', {
      'content-type': 'application/json',
      'content-length': RAW_MESSAGE.length
    })

    handler(request, response, nextSpy)

    request.emit('data', RAW_MESSAGE)
    request.emit('end')

    process.nextTick(() => {
      expect(fileListMock.refresh).not.to.have.been.called
      expect(executor.schedule).to.have.been.called
      done()
    })
  })

  it('should not schedule execution if refreshing and autoWatch', (done) => {
    config.autoWatch = true

    capturedBrowsers.add(new Browser())
    sinon.stub(capturedBrowsers, 'areAllReady', () => true)

    sinon.spy(fileListMock, 'refresh')
    sinon.stub(executor, 'schedule')

    handler(new HttpRequestMock('/__run__'), response, nextSpy)

    process.nextTick(() => {
      expect(fileListMock.refresh).to.have.been.called
      expect(executor.schedule).not.to.have.been.called
      done()
    })
  })

  it('should ignore other urls', (done) => {
    handler(new HttpRequestMock('/something'), response, () => {
      expect(response).to.beNotServed()
      done()
    })
  })
})
