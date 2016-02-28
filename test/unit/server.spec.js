import Server from '../../lib/server'
import BrowserCollection from '../../lib/browser_collection'

describe('server', () => {
  var mockConfig
  var browserCollection
  var webServerOnError
  var fileListOnReject
  var mockLauncher
  var mockWebServer
  var mockSocketServer
  var mockExecutor
  var doneSpy
  var server = mockConfig = browserCollection = webServerOnError = null
  var fileListOnResolve = fileListOnReject = mockLauncher = null
  var mockFileList = mockWebServer = mockSocketServer = mockExecutor = doneSpy = null

  beforeEach(() => {
    browserCollection = new BrowserCollection()
    doneSpy = sinon.spy()

    fileListOnResolve = fileListOnReject = null

    doneSpy = sinon.spy()

    mockConfig =
      {frameworks: [],
        port: 9876,
        autoWatch: true,
        hostname: 'localhost',
        urlRoot: '/',
        browsers: ['fake'],
        singleRun: true,
        logLevel: 'OFF',
      browserDisconnectTolerance: 0}

    server = new Server(mockConfig, doneSpy)

    sinon.stub(server._injector, 'invoke').returns([])

    mockExecutor =
      {schedule: () => {}}

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
      flashPolicyServer: {
        close: () => {}
      },
      sockets: {
        sockets: {},
        on: () => {},
        emit: () => {}
      }
    }

    mockWebServer = {
      on (name, handler) {
        if (name === 'error') {
          webServerOnError = handler
        }
      },
      listen: sinon.spy((port, callback) => {
        callback && callback()
      }),
      removeAllListeners: () => {},
      close: () => {}
    }

    webServerOnError = null
  })

  // ============================================================================
  // server._start()
  // ============================================================================
  describe('_start', () => {
    it('should start the web server after all files have been preprocessed successfully', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnResolve).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.called
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should start the web server after all files have been preprocessed with an error', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnReject).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnReject()

      expect(mockWebServer.listen).to.have.been.called
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should launch browsers after the web server has started', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(server._injector.invoke).not.to.have.been.calledWith(mockLauncher.launch, mockLauncher)

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.called
      expect(server._injector.invoke).to.have.been.calledWith(mockLauncher.launch, mockLauncher)
    })

    it('should try next port if already in use', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(webServerOnError).not.to.be.null

      expect(mockConfig.port).to.be.equal(9876)

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.calledWith(9876)

      webServerOnError({code: 'EADDRINUSE'})

      expect(mockWebServer.listen).to.have.been.calledWith(9877)
      expect(mockConfig.port).to.be.equal(9877)
    })

    it('should emit a listening event once server begin accepting connections', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      var listening = sinon.spy()
      server.on('listening', listening)

      expect(listening).not.to.have.been.called

      fileListOnResolve()

      expect(listening).to.have.been.calledWith(9876)
    })

    it('should emit a browsers_ready event once all the browsers are captured', () => {
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

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
      server._start(mockConfig, mockLauncher, null, mockFileList, mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      var browsersReady = sinon.spy()
      server.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = () => false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = () => true
      server.emit('browser_register', {})
      expect(browsersReady).to.have.been.called
    })
  })

  describe.skip('singleRun', () => {
    it('should run tests when all browsers captured', () => {})
    it('should run tests when first browser captured if no browser configured', () => {})
  })
})
