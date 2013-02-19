#==============================================================================
# lib/reporters/Coverage.js module
#==============================================================================
describe 'reporter', ->
  events = require 'events'
  path = require 'path'
  istanbul = require 'istanbul'
  helper = require '../../../lib/helper'
  browser = require '../../../lib/browser'
  Browser = browser.Browser
  Collection = browser.Collection
  nodeMocks = require 'mocks'
  loadFile = nodeMocks.loadFile
  m = null

  mockFs =
    writeFile: sinon.spy()

  mockStore = sinon.spy()
  mockStore.mix = (fn, obj) ->
    istanbul.Store.mix fn, obj
  mockFslookup = sinon.stub
    keys: ->
    get: ->
    hasKey: ->
    set: ->
  mockStore.create = sinon.stub().returns mockFslookup
  
  mockAdd = sinon.spy()
  mockDispose = sinon.spy()
  mockCollector = class Collector
    add: mockAdd
    dispose: mockDispose
  mockWriteReport = sinon.spy()
  mockReportCreate = sinon.stub().returns writeReport: mockWriteReport
  mockMkdir = sinon.spy()
  mockHelper =
    isDefined: (v) -> helper.isDefined v
    merge: (v...) -> helper.merge v...
    mkdirIfNotExists: mockMkdir

  mocks =
    fs: mockFs
    istanbul:
      Store: mockStore
      Collector: mockCollector
      Report: create: mockReportCreate
    dateformat: require 'dateformat'
    '../logger': require '../../../lib/logger'
    '../helper' : mockHelper


  beforeEach ->
    m = loadFile __dirname + '/../../../lib/reporters/Coverage.js', mocks

  describe 'BasePathStore', ->
    options = store = null

    beforeEach ->
      options =
        basePath: 'path/to/coverage/'
      store = new m.BasePathStore options

    it 'should call create', ->
      expect(mockStore.create).to.have.been.calledWith 'fslookup'

    describe 'toKey', ->
      it 'should concat relative path and basePath', ->
        expect(store.toKey './foo').to.deep.equal path.join(options.basePath, 'foo')

      it 'should does not concat absolute path and basePath', ->
        expect(store.toKey '/foo').to.deep.equal '/foo'

    it 'should call keys and delegate to inline store', ->
      store.keys()
      expect(mockFslookup.keys).to.have.been.called

    it 'should call get and delegate to inline store', ->
      key = './path/to/js'
      store.get(key)
      expect(mockFslookup.get).to.have.been.calledWith path.join(options.basePath, key)

    it 'should call hasKey and delegate to inline store', ->
      key = './path/to/js'
      store.hasKey(key)
      expect(mockFslookup.hasKey).to.have.been.calledWith path.join(options.basePath, key)

    it 'should call set and delegate to inline store', ->
      key = './path/to/js'
      content = 'any content'
      store.set key, content
      expect(mockFslookup.set).to.have.been.calledWith path.join(options.basePath, key), content

  describe 'CoverageReporter', ->
    rootConfig = emitter = reporter = null
    browsers = fakeChrome = fakeOpera = null

    makeBrowser = (id, name, collection, emitter) ->
      browser = new Browser id, collection, emitter
      browser.onRegister
        id: id + name
        name: name
      browser

    beforeEach ->
      rootConfig =
        coverageReporter: dir: 'path/to/coverage/'
      emitter = new events.EventEmitter
      reporter = new m.CoverageReporter rootConfig, emitter
      browsers = new Collection emitter
      # fake user agent only for testing
      # cf. helper.browserFullNameToShort
      fakeChrome = makeBrowser 'aaa', 'Windows NT 6.1 Chrome/16.0.912.75', browsers, emitter
      fakeOpera = makeBrowser 'bbb', 'Opera/9.80 Mac OS X Version/12.00', browsers, emitter
      browsers.add fakeChrome
      browsers.add fakeOpera
      reporter.onRunStart browsers
      mockFs.writeFile.reset()
      mockMkdir.reset()

    it 'has no pending file writings', ->
      done = sinon.spy()
      emitter.emit 'exit', done
      expect(done).to.have.been.called

    it 'has no coverage', ->
      result =
        coverage: null
      reporter.onBrowserComplete fakeChrome, result
      expect(mockAdd).not.to.have.been.called

    it 'should store coverage json', ->
      result =
        coverage:
          aaa: 1
          bbb: 2
      reporter.onBrowserComplete fakeChrome, result
      expect(mockAdd).to.have.been.calledWith result.coverage
      expect(mockMkdir).to.have.been.called
      args = mockMkdir.lastCall.args
      expect(args[0]).to.deep.equal path.resolve(rootConfig.coverageReporter.dir)
      args[1]()
      expect(mockFs.writeFile).to.have.been.calledWith 
      args2 = mockFs.writeFile.lastCall.args
      expect(args2[1]).to.deep.equal JSON.stringify(result.coverage)

    it 'should make reports', ->
      reporter.onRunComplete browsers
      expect(mockMkdir).to.have.been.calledTwice
      dir = rootConfig.coverageReporter.dir
      expect(mockMkdir.getCall(0).args[0]).to.deep.equal path.resolve(dir, fakeChrome.name)
      expect(mockMkdir.getCall(1).args[0]).to.deep.equal path.resolve(dir, fakeOpera.name)
      mockMkdir.getCall(0).args[1]()
      expect(mockReportCreate).to.have.been.called
      expect(mockWriteReport).to.have.been.called
      expect(mockDispose).to.have.been.called
