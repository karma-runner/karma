var Server = require('../../lib/server')
var BundleUtils = require('../../lib/utils/bundle-utils')
var NetUtils = require('../../lib/utils/net-utils')
var BrowserCollection = require('../../lib/browser_collection')

describe('server', () => {
  var mockConfig
  var browserCollection
  var webServerOnError
  var fileListOnReject
  var mockLauncher
  var mockWebServer
  var mockSocketServer
  var mockBoundServer
  var mockExecutor
  var doneSpy
  var server = mockConfig = browserCollection = webServerOnError = null
  var fileListOnResolve = fileListOnReject = mockLauncher = null
  var mockFileList = mockWebServer = mockSocketServer = mockExecutor = doneSpy = null

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

    mockSocketServer = {
      close: () => {},
      flashPolicyServer: {
        close: () => {}
      },
      sockets: {
        sockets: {},
        on: () => {},
        emit: () => {},
        removeAllListeners: () => {}
      }
    }

    mockBoundServer = {
      on: sinon.spy((event, callback) => callback && callback()),
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
        var callback = null
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
    var config
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

  // ============================================================================
  // server._start()
  // ============================================================================
  describe('_start', () => {
    beforeEach(() => {
      server._boundServer = mockBoundServer
    })

    it('should start the web server after all files have been preprocessed successfully', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnResolve).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should start the web server after all files have been preprocessed with an error', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnReject).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnReject()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should launch browsers after the web server has started', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(webServerOnError).not.to.be.null
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()
      expect(mockWebServer.listen).to.have.been.calledWith(mockBoundServer, sinon.match.func)
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should emit a listening event once server begin accepting connections', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      var listening = sinon.spy()
      server.on('listening', listening)

      expect(listening).not.to.have.been.called

      fileListOnResolve()
      expect(listening).to.have.been.calledWith(9876)
    })

    it('should emit a browsers_ready event once all the browsers are captured', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      var browsersReady = sinon.spy()
      server.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = () => false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = () => true
      server.emit('browser_register', {})
      expect(browsersReady).to.have.been.called
    })

    it('should emit a browser_register event for each browser added', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, doneSpy)

      var browsersReady = sinon.spy()
      server.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = () => false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = () => true
      server.emit('browser_register', {})
      expect(browsersReady).to.have.been.called
    })

    it('should exit with error exit code on load errors', (done) => {
      mockProcess(process)

      server._start(mockConfig, mockLauncher, null, mockFileList, browserCollection, mockExecutor, (exitCode) => {
        expect(exitCode).to.have.equal(1)
        done()
      })

      server.loadErrors.push(['TestError', 'Test'])
      fileListOnResolve()

      function mockProcess (process) {
        sinon.stub(process, 'kill').callsFake((pid, ev) => process.emit(ev))
      }
    })
  })
})
