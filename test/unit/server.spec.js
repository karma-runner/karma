const Server = require('../../lib/server')
const NetUtils = require('../../lib/utils/net-utils')
const BrowserCollection = require('../../lib/browser_collection')
const cfg = require('../../lib/config')
const logger = require('../../lib/logger')

describe('server', () => {
  let mockConfig
  let browserCollection
  let webServerOnError
  let fileListOnReject
  let mockLauncher
  let mockWebServer
  let mockServerSocket
  let mockSocketServer
  let mockBoundServer
  let mockExecutor
  let doneStub
  let log
  let logErrorSpy
  let logWarnStub
  let server = mockConfig = browserCollection = webServerOnError = null
  let fileListOnResolve = fileListOnReject = mockLauncher = null
  let mockFileList = mockWebServer = mockSocketServer = mockExecutor = doneStub = null
  const mockSocketEventListeners = new Map()

  // Use regular function not arrow so 'this' is mocha 'this'.
  beforeEach(function () {
    // The first call to new Server() loads plugins and it can take >2000ms.
    this.timeout(4000)
    browserCollection = new BrowserCollection()
    doneStub = sinon.stub()
    log = logger.create('karma-server')
    logErrorSpy = sinon.spy(log, 'error')
    logWarnStub = sinon.stub(log, 'warn')

    fileListOnResolve = fileListOnReject = null

    mockConfig = {
      frameworks: [],
      port: 9876,
      autoWatch: true,
      listenAddress: '127.0.0.1',
      hostname: 'localhost',
      urlRoot: '/',
      browsers: ['fake'],
      singleRun: true,
      logLevel: 'OFF',
      plugins: [],
      browserDisconnectTolerance: 0,
      browserNoActivityTimeout: 0
    }
    server = new Server(mockConfig, doneStub)

    sinon.stub(server._injector, 'invoke').returns([])

    mockExecutor = { schedule: () => {} }

    mockFileList = {
      refresh: sinon.spy(() => {
        return {
          then (onResolve, onReject) {
            fileListOnResolve = onResolve
            fileListOnReject = onReject
          }
        }
      })
    }

    mockLauncher = {
      launch: () => {},
      markCaptured: () => {},
      areAllCaptured: () => false,
      restart: () => true,
      kill: () => true
    }

    mockServerSocket = {
      id: 'socket-id',
      on: (name, handler) => mockSocketEventListeners.set(name, handler),
      emit: () => {},
      removeListener: () => {}
    }

    mockSocketServer = {
      close: () => {},
      flashPolicyServer: {
        close: () => {}
      },
      sockets: {
        sockets: {},
        on: (name, handler) => handler(mockServerSocket),
        emit: () => {},
        removeAllListeners: () => {}
      }
    }

    mockBoundServer = {
      on: sinon.spy((event, callback) => callback && callback(mockServerSocket)),
      listen: sinon.spy((port, listenAddress, callback) => callback && callback()),
      close: sinon.spy((callback) => callback && callback()),
      address: () => { return { port: 9876 } }
    }

    mockWebServer = {
      on (name, handler) {
        if (name === 'error') {
          webServerOnError = handler
        }
      },
      listen: sinon.spy((port, arg2, arg3) => {
        let callback = null
        if (typeof arg2 === 'function') {
          callback = arg2
        } else if (typeof arg3 === 'function') {
          callback = arg3
        }
        callback && callback()
      }),
      removeAllListeners: () => {},
      close: sinon.spy((callback) => callback && callback())
    }

    const injectorStub = sinon.stub(server._injector, 'get')
    injectorStub.withArgs('socketServer').returns(mockSocketServer)
    injectorStub.withArgs('webServer').returns(mockWebServer)
    injectorStub.callThrough()

    webServerOnError = null
  })

  afterEach(() => {
    logWarnStub.restore()
  })

  describe('constructor', () => {
    it('should log a warning when the first argument is not an instance of Config', async () => {
      // Reset the spy interface on the stub. It may have already been called by
      // code in the `before` or `beforeEach` hooks.
      logWarnStub.resetHistory()

      const rawConfig = {
        karmaConfigForTest: true
      }
      return cfg.parseConfig(
        null,
        rawConfig,
        { promiseConfig: true, throwErrors: true }
      ).then((parsedConfig) => {
        const messageSubstring =
          'Passing raw CLI options to `new Server(config, done)` is ' +
          'deprecated.'

        const serverWithParsed = new Server(parsedConfig, doneStub) // eslint-disable-line no-unused-vars
        expect(logWarnStub).to.not.have.been.calledWith(sinon.match(messageSubstring))

        const serverWithRaw = new Server(rawConfig, doneStub) // eslint-disable-line no-unused-vars
        expect(logWarnStub).to.have.been.calledOnceWith(sinon.match(messageSubstring))
      })
    })
  })

  describe('start', () => {
    let config
    beforeEach(() => {
      config = { port: 9876, listenAddress: '127.0.0.1' }
      sinon.stub(NetUtils, 'bindAvailablePort').resolves(mockBoundServer)
      sinon.stub(mockBoundServer, 'address').returns({ port: 9877 })
      sinon
        .stub(server, 'get')
        .withArgs('config').returns(config)
    })

    it('should search for available port', (done) => {
      server.start().then(() => {
        expect(NetUtils.bindAvailablePort).to.have.been.calledWith(9876, '127.0.0.1')
        expect(mockBoundServer.address).to.have.been.called
        expect(typeof mockSocketEventListeners.get('error')).to.be.equal('function')
        done()
      })
    })

    it('should change config.port to available', (done) => {
      expect(config.port).to.be.equal(9876)
      server.start().then(() => {
        expect(config.port).to.be.equal(9877)
        expect(server._boundServer).to.be.equal(mockBoundServer)
        done()
      })
    })
  })

  describe('start on watch mode', () => {
    var config
    beforeEach(() => {
      config = { port: 9876, listenAddress: '127.0.0.1', singleRun: false }
      sinon.stub(NetUtils, 'bindAvailablePort').resolves(mockBoundServer)
      sinon.stub(mockBoundServer, 'address').returns({ port: 9877 })
      sinon
        .stub(server, 'get')
        .withArgs('config').returns(config)
    })

    it('should exit gracefully', (done) => {
      server.start()
        .then(() => server.stop())
        .then(() => done())
    })
  })

  // ============================================================================
  // server._start()
  // ============================================================================
  describe('_start', () => {
    beforeEach(() => {
      server._boundServer = mockBoundServer
    })

    it('should start the web server after all files have been preprocessed successfully', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnResolve).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should start the web server after all files have been preprocessed with an error', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnReject).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      const fileListRefreshError = new Error('file-list refresh error')
      fileListOnReject(fileListRefreshError)
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
      expect(logErrorSpy).to.have.been.calledWith('Error during file loading or preprocessing\n' + fileListRefreshError.stack)
    })

    it('should launch browsers after the web server has started', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should emit a listening event once server begin accepting connections', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      const listening = sinon.spy()
      server.on('listening', listening)

      expect(listening).not.to.have.been.called

      fileListOnResolve()
      expect(listening).to.have.been.calledWith(9876)
    })

    it('should emit a browsers_ready event once all the browsers are captured', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      const browsersReady = sinon.spy()
      server.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = () => false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = () => true
      server.emit('browser_register', {})
      expect(browsersReady).to.have.been.called
    })

    it('should emit a browser_register event for each browser added', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

      const browsersReady = sinon.spy()
      server.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = () => false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = () => true
      server.emit('browser_register', {})
      expect(browsersReady).to.have.been.called
    })
    describe('should exit with exit code', () => {
      let resolveExitCode

      async function exitCode () {
        return new Promise((resolve) => {
          resolveExitCode = resolve
        })
      }

      beforeEach(() => {
        doneStub.callsFake((exitCode) => resolveExitCode(exitCode))
      })

      it('1 on load errors', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)
        server.loadErrors.push(['TestError', 'Test'])
        fileListOnResolve()

        expect(await exitCode()).to.have.equal(1)
      })

      it('given on run_complete', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.emit('run_complete', browserCollection, { exitCode: 15 })

        expect(await exitCode()).to.have.equal(15)
      })

      it('given on run_complete with exit event listener (15)', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        // last non-zero exit code will be taken
        server.on('exit', (done) => {
          setTimeout(() => done(30))
        })
        server.on('exit', (done) => {
          setTimeout(() => done(15))
        })
        server.on('exit', (done) => {
          setTimeout(() => done(0))
        })

        // Provided run_complete exitCode will be overridden by exit listeners
        server.emit('run_complete', browserCollection, { exitCode: 5 })

        expect(await exitCode()).to.have.equal(15)
      })

      it('given on run_complete with exit event listener (0)', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        // exit listeners can't set exit code back to 0
        server.on('exit', (done) => {
          setTimeout(() => done(0))
        })

        server.emit('run_complete', browserCollection, { exitCode: 15 })

        expect(await exitCode()).to.have.equal(15)
      })

      it('1 on run_complete with exit event listener throws', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.on('exit', (done) => {
          throw new Error('async error from exit event listener')
        })

        server.emit('run_complete', browserCollection, { exitCode: 0 })

        expect(await exitCode()).to.have.equal(1)
      })

      it('1 on run_complete with exit event listener rejects', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        function onExit (done) {
          // Need to remove listener to prevent endless loop via unhandledRejection handler
          // which again calls disconnectBrowsers to fire the 'exit' event
          server.off('exit', onExit)
          return Promise.reject(new Error('async error from exit event listener'))
        }
        server.on('exit', onExit)

        server.emit('run_complete', browserCollection, { exitCode: 0 })

        expect(await exitCode()).to.have.equal(1)
      })

      it('0 on server stop', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.stop()

        expect(await exitCode()).to.have.equal(0)
      })

      it('1 on browser_process_failure (singleRunBrowserNotCaptured)', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.emit('browser_process_failure', { id: 'fake' })

        expect(await exitCode()).to.have.equal(1)
      })

      it('0 on browser_complete_with_no_more_retries', async () => {
        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.emit('browser_complete_with_no_more_retries', { id: 'fake', remove: () => {} })

        expect(await exitCode()).to.have.equal(0)
      })

      it('1 on browser_complete_with_no_more_retries with config.failOnEmptyTestSuite', async () => {
        mockConfig.failOnEmptyTestSuite = true

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneStub)

        server.emit('browser_complete_with_no_more_retries', { id: 'fake', remove: () => {} })

        expect(await exitCode()).to.have.equal(1)
      })
    })
  })
})
