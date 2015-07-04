# TODO(vojta):
# single run
'should run tests when all browsers captured'
'should run tests when first browser captured if no browser configured'

#==============================================================================
# lib/server.js module
#==============================================================================
describe 'server', ->
  BrowserCollection = require('../../lib/browser_collection')
  EventEmitter = require('events').EventEmitter
  loadFile = require('mocks').loadFile
  q = require('q')

  m = mockConfig = browserCollection = emitter = injector = webServerOnError = null
  fileListOnResolve = fileListOnReject = mockInjector = mockLauncher = null
  mockFileList = mockWebServer = mockSocketServer = mockExecutor = doneSpy = null

  beforeEach ->
    browserCollection = new BrowserCollection
    doneSpy = sinon.spy()
    emitter = new EventEmitter

    fileListOnResolve = fileListOnReject = null

    m = loadFile __dirname + '/../../lib/server.js'

    mockConfig =
      frameworks: []
      port: 9876
      autoWatch: true
      hostname: 'localhost'
      urlRoot: '/'
      browsers: ['fake']
      singleRun: true
      browserDisconnectTolerance: 0

    mockExecutor =
      schedule: ->

    mockFileList =
      refresh: sinon.spy( -> then: (onResolve, onReject) ->
        fileListOnResolve = onResolve
        fileListOnReject = onReject
      )

    mockInjector =
      get: ->
      invoke: sinon.spy( -> [])
      createChild: ->
        instantiate: ->
          init: ->

    mockLauncher =
      launch: ->
      markCaptured: ->
      areAllCaptured: -> false
      restart: -> true
      kill: -> true

    mockSocketServer =
      flashPolicyServer:
        close: ->
      sockets:
        sockets: {}
        on: ->
        emit: ->

    mockWebServer =
      on: (name, handler) ->
        if name == 'error'
          webServerOnError = handler
      listen: sinon.spy((port, callback) -> callback && callback())
      removeAllListeners: ->
      close: ->

    webServerOnError = null

  #============================================================================
  # server.start()
  #============================================================================
  describe 'start', ->
    it 'should start the web server after all files have been preprocessed successfully', ->
      m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnResolve).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(mockInjector.invoke).not.to.have.been.calledWith mockLauncher.launch, mockLauncher

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.called
      expect(mockInjector.invoke).to.have.been.calledWith mockLauncher.launch, mockLauncher

    it 'should start the web server after all files have been preprocessed with an error', ->
      m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockFileList.refresh).to.have.been.called
      expect(fileListOnReject).not.to.be.null
      expect(mockWebServer.listen).not.to.have.been.called
      expect(mockInjector.invoke).not.to.have.been.calledWith mockLauncher.launch, mockLauncher

      fileListOnReject()

      expect(mockWebServer.listen).to.have.been.called
      expect(mockInjector.invoke).to.have.been.calledWith mockLauncher.launch, mockLauncher

    it 'should launch browsers after the web server has started', ->
      m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(mockInjector.invoke).not.to.have.been.calledWith mockLauncher.launch, mockLauncher

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.called
      expect(mockInjector.invoke).to.have.been.calledWith mockLauncher.launch, mockLauncher

    it 'should return the event emitter', ->
      emitter = m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(emitter).not.to.be.null
      expect(emitter).to.be.an.instanceof(EventEmitter)

    it 'should emit a browsers_ready event once all the browsers are captured', ->
      emitter = m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      browsersReady = sinon.spy()
      emitter.on('browsers_ready', browsersReady)

      mockLauncher.areAllCaptured = -> false
      fileListOnResolve()
      expect(browsersReady).not.to.have.been.called

      mockLauncher.areAllCaptured = -> true
      emitter.emit('browser_register', {})
      expect(browsersReady).to.have.been.called

    it 'should try next port if already in use', ->
      m.start(mockInjector, mockConfig, mockLauncher, emitter, null, mockFileList,
        mockWebServer, browserCollection, mockSocketServer, mockExecutor, doneSpy)

      expect(mockWebServer.listen).not.to.have.been.called
      expect(webServerOnError).not.to.be.null

      expect(mockConfig.port).to.be.equal 9876

      fileListOnResolve()

      expect(mockWebServer.listen).to.have.been.calledWith(9876)

      webServerOnError({ code: 'EADDRINUSE'})

      expect(mockWebServer.listen).to.have.been.calledWith(9877)
      expect(mockConfig.port).to.be.equal 9877
