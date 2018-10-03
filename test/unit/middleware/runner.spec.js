const path = require('path')
const EventEmitter = require('events').EventEmitter
const mocks = require('mocks')
const Promise = require('bluebird')
const _ = require('lodash')

const Browser = require('../../../lib/browser')
const BrowserCollection = require('../../../lib/browser_collection')
const MultReporter = require('../../../lib/reporters/multi')
const createRunnerMiddleware = require('../../../lib/middleware/runner').create

const HttpResponseMock = mocks.http.ServerResponse
const HttpRequestMock = mocks.http.ServerRequest

describe('middleware.runner', () => {
  let nextSpy
  let response
  let mockReporter
  let capturedBrowsers
  let emitter
  let config
  let executor
  let handler
  let fileListMock

  function createHandler () {
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
  }

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
  })

  describe('', () => {
    beforeEach(() => {
      createHandler()
    })

    it('should trigger test run and stream the reporter', (done) => {
      capturedBrowsers.add(new Browser())
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

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

    it('should refresh explicit files if specified', (done) => {
      capturedBrowsers.add(new Browser())
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)
      sinon.stub(fileListMock, 'refresh')
      sinon.stub(fileListMock, 'addFile')
      sinon.stub(fileListMock, 'changeFile')
      sinon.stub(fileListMock, 'removeFile')

      const RAW_MESSAGE = JSON.stringify({
        addedFiles: ['/new.js'],
        removedFiles: ['/foo.js', '/bar.js'],
        changedFiles: ['/changed.js']
      })

      const request = new HttpRequestMock('/__run__', {
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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

      let res = null
      const fileListPromise = new Promise((resolve, reject) => {
        res = resolve
      })
      sinon.stub(fileListMock, 'refresh').returns(fileListPromise)
      sinon.stub(executor, 'schedule')

      const request = new HttpRequestMock('/__run__')
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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

      sinon.spy(fileListMock, 'refresh')
      sinon.stub(executor, 'schedule')

      const RAW_MESSAGE = JSON.stringify({refresh: false})

      const request = new HttpRequestMock('/__run__', {
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
      sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)

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

  describe('', () => {
    var clientArgsRuns = [
      {
        desc: 'should parse body and set client.args',
        expected: ['arg1', 'arg2'],
        rawMessage: '{"args": ["arg1", "arg2"]}'
      },
      {
        desc: 'should set array client args passed by run when there are no existing client.args',
        expected: ['my_args'],
        rawMessage: '{"args": ["my_args"]}'
      },
      {
        desc: 'should set object client args passed by run when there are no existing client.args',
        expected: {arg2: 'fig', arg3: 'chocolate'},
        rawMessage: '{"args": {"arg2": "fig", "arg3": "chocolate"}}'
      },
      {
        desc: 'should overwrite empty array client.args when run passes an array for client.args',
        expected: ['user_arg1'],
        rawMessage: '{"args": ["user_arg1"]}',
        existingConfig: []
      },
      {
        desc: 'should overwrite empty array client.args when run passes an object for client.args',
        expected: {arg2: 'figs', arg3: 'chocolates'},
        rawMessage: '{"args": {"arg2": "figs", "arg3": "chocolates"}}',
        existingConfig: []
      },
      {
        desc: 'should overwrite empty object client.args when run passes an array for client.args',
        expected: ['user_arg'],
        rawMessage: '{"args": ["user_arg"]}',
        existingConfig: {}
      },
      {
        desc: 'should not overwrite existing array client.args when run passes an empty array for client.args',
        expected: ['user_arg'],
        rawMessage: '{"args": []}',
        existingConfig: ['user_arg']
      },
      {
        desc: 'should not overwrite existing array client.args when run passes an empty object for client.args',
        expected: ['user_arg'],
        rawMessage: '{"args": {}}',
        existingConfig: ['user_arg']
      },
      {
        desc: 'should not overwrite existing array client.args when run passes no client.args',
        expected: ['user_arg'],
        rawMessage: '{}',
        existingConfig: ['user_arg']
      },
      {
        desc: 'should merge existing client.args with client.args passed by run',
        expected: {arg1: 'cherry', arg2: 'fig', arg3: 'chocolate'},
        rawMessage: '{"args": {"arg2": "fig", "arg3": "chocolate"}}',
        existingConfig: {arg1: 'cherry', arg2: 'mango'}
      },
      {
        desc: 'should merge empty client.args with client.args passed by run',
        expected: {arg2: 'fig', arg3: 'chocolate'},
        rawMessage: '{"args": {"arg2": "fig", "arg3": "chocolate"}}',
        existingConfig: {}
      }
    ]

    clientArgsRuns.forEach(function (run) {
      it(run.desc, (done) => {
        capturedBrowsers.add(new Browser())
        sinon.stub(capturedBrowsers, 'areAllReady').callsFake(() => true)
        if (run.existingConfig) {
          config = _.merge(config, {client: {args: run.existingConfig}})
        }
        createHandler()

        emitter.once('run_start', () => {
          expect(config.client.args).to.deep.equal(run.expected)
          expect(config.client.originalArgs).to.deep.equal(run.existingConfig)
          done()
        })

        var RAW_MESSAGE = run.rawMessage

        var request = new HttpRequestMock('/__run__', {
          'content-type': 'application/json',
          'content-length': RAW_MESSAGE.length
        })

        handler(request, response, nextSpy)

        request.emit('data', RAW_MESSAGE)
        request.emit('end')
      })
    })
  })
})
