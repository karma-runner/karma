const Server = require('../../lib/server')
const BundleUtils = require('../../lib/utils/bundle-utils')
const NetUtils = require('../../lib/utils/net-utils')
const BrowserCollection = require('../../lib/browser_collection')
const Browser = require('../../lib/browser')

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
  let doneSpy
  let server = mockConfig = browserCollection = webServerOnError = null
  let fileListOnResolve = fileListOnReject = mockLauncher = null
  let mockFileList = mockWebServer = mockSocketServer = mockExecutor = doneSpy = null
  const mockSocketEventListeners = new Map()

  // Use regular function not arrow so 'this' is mocha 'this'.
  beforeEach(function () {
    // The first call to new Server() loads plugins and it can take >2000ms.
    this.timeout(4000)
    browserCollection = new BrowserCollection()
    doneSpy = sinon.spy()

    fileListOnResolve = fileListOnReject = null

    doneSpy = sinon.spy()

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
      browserDisconnectTolerance: 0
    }

    server = new Server(mockConfig, doneSpy)

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

    sinon
      .stub(server._injector, 'get')
      .withArgs('webServer').returns(mockWebServer)
      .withArgs('socketServer').returns(mockSocketServer)

    webServerOnError = null
  })

  describe('start', () => {
    let config
    beforeEach(() => {
      config = { port: 9876, listenAddress: '127.0.0.1' }
      sinon.spy(BundleUtils, 'bundleResourceIfNotExist')
      sinon.stub(NetUtils, 'bindAvailablePort').resolves(mockBoundServer)
      sinon.stub(mockBoundServer, 'address').returns({ port: 9877 })
      sinon
        .stub(server, 'get')
        .withArgs('config').returns(config)
    })

    it('should compile static resources', (done) => {
      server.start().then(() => {
        expect(BundleUtils.bundleResourceIfNotExist).to.have.been.calledWith('client/main.js', 'static/karma.js')
        expect(BundleUtils.bundleResourceIfNotExist).to.have.been.calledWith('context/main.js', 'static/context.js')
        done()
      })
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
      sinon.spy(BundleUtils, 'bundleResourceIfNotExist')
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
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

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
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnReject).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnReject()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should launch browsers after the web server has started', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should emit a listening event once server begin accepting connections', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      const listening = sinon.spy()
      server.on('listening', listening)

      expect(listening).not.to.have.been.called

      fileListOnResolve()
      expect(listening).to.have.been.calledWith(9876)
    })

    it('should emit a browsers_ready event once all the browsers are captured', async () => {
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

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
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

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

      it('1 on load errors', async () => {
        mockProcess(process)

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
          resolveExitCode(exitCode)
        })
        server.loadErrors.push(['TestError', 'Test'])
        fileListOnResolve()

        function mockProcess (process) {
          sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
        }

        expect(await exitCode()).to.have.equal(1)
      })

      it('given on run_complete', async () => {
        mockProcess(process)

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
          resolveExitCode(exitCode)
        })

        server.emit('run_complete', browserCollection, { exitCode: 15 })

        function mockProcess (process) {
          sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
        }
        expect(await exitCode()).to.have.equal(15)
      })

      it('1 on browser_process_failure (singleRunBrowserNotCaptured)', async () => {
        mockProcess(process)

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
          resolveExitCode(exitCode)
        })

        server.emit('browser_process_failure', { id: 'fake' })

        function mockProcess (process) {
          sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
        }
        expect(await exitCode()).to.have.equal(1)
      })

      it('0 on browser_complete_with_no_more_retries', async () => {
        mockProcess(process)

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
          resolveExitCode(exitCode)
        })

        server.emit('browser_complete_with_no_more_retries', { id: 'fake' })

        function mockProcess (process) {
          sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
        }
        expect(await exitCode()).to.have.equal(0)
      })

      it('1 on browser_complete_with_no_more_retries with config.failOnEmptyTestSuite', async () => {
        mockProcess(process)

        mockConfig.failOnEmptyTestSuite = true

        await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
          resolveExitCode(exitCode)
        })

        server.emit('browser_complete_with_no_more_retries', { id: 'fake' })

        function mockProcess (process) {
          sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
        }
        expect(await exitCode()).to.have.equal(1)
      })
    })
  })

  describe('reconnecting browser', () => {
    let mockBrowserSocket

    beforeEach(async () => {
      browserCollection = new BrowserCollection(server)
      await server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      mockBrowserSocket = {
        id: 'browser-socket-id',
        on: () => {},
        emit: () => {}
      }
    })

    it('should re-configure disconnected browser which has been restarted', () => {
      const testBrowserId = 'my-id'
      const browser = new Browser(testBrowserId, 'Chrome 19.0', browserCollection, server,
        mockBrowserSocket, null, 0)
      const registerFn = mockSocketEventListeners.get('register')

      browser.init()
      browserCollection.add(browser)

      // We assume that our browser was running when it disconnected randomly.
      browser.setState(Browser.STATE_EXECUTING_DISCONNECTED)

      // We now simulate a "connect" event from the Karma client where it registers
      // a previous browser that disconnected while executing. Usually if it was just a
      // socket.io reconnect, we would not want to restart the execution, but since this is
      // a complete reconnect, we want to configure the browser and start a new execution.
      registerFn({
        name: 'fake-name',
        id: testBrowserId,
        isSocketReconnect: false
      })

      expect(browser.state).to.equal(Browser.STATE_CONFIGURING)
    })
  })
})
