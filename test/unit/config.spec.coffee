#==============================================================================
# lib/config.js module
#==============================================================================
describe 'config', ->
  fsMock = require('mocks').fs
  loadFile = require('mocks').loadFile
  mocks = m = e = null
  path = require('path')
  util = require('../../lib/util')

  resolveWinPath = (p) -> util.normalizeWinPath(path.resolve(p))

  normalizeConfigWithDefaults = (cfg) ->
    cfg.urlRoot = '' if not cfg.urlRoot
    cfg.files = [] if not cfg.files
    cfg.exclude = [] if not cfg.exclude
    cfg.junitReporter = {} if not cfg.junitReporter
    m.normalizeConfig cfg

  beforeEach ->
    # create instance of fs mock
    mocks = {}
    mocks.process = exit: jasmine.createSpy 'exit'
    mocks.fs = fsMock.create
      bin:
        sub:
          'one.js'  : fsMock.file '2011-12-25'
          'two.js'  : fsMock.file '2011-12-26'
          'log.txt' : 1
        mod:
          'one.js'  : 1
          'test.xml': 1
        'file.js' : 1
        'some.txt': 1
        'more.js' : 1
      home:
        '.vojta'   : 1
        'config1.js': fsMock.file 0, 'basePath = "base";reporter="dots"'
        'config2.js': fsMock.file 0, 'basePath = "/abs/base"'
        'config3.js': fsMock.file 0, 'files = ["one.js", "sub/two.js"];'
        'config4.js': fsMock.file 0, 'port = 123; autoWatch = true; basePath = "/abs/base"'
        'config5.js': fsMock.file 0, 'port = {f: __filename, d: __dirname}' # piggyback on port prop
        'config6.js': fsMock.file 0, 'reporters = "junit";'
      conf:
        'invalid.js': fsMock.file 0, '={function'
        'exclude.js': fsMock.file 0, 'exclude = ["one.js", "sub/two.js"];'
        'absolute.js': fsMock.file 0, 'files = ["http://some.com", "https://more.org/file.js"];'
        'both.js': fsMock.file 0, 'files = ["one.js", "two.js"]; exclude = ["third.js"]'
        'coffee.coffee': fsMock.file 0, 'files = [ "one.js"\n  "two.js"]'
    # load file under test
    m = loadFile __dirname + '/../../lib/config.js', mocks, {process: mocks.process}
    e = m.exports


  #============================================================================
  # config.parseConfig()
  # Should parse configuration file and do some basic processing as well
  #============================================================================
  describe 'parseConfig', ->
    consoleSpy = null

    beforeEach ->
      logger = require '../../lib/logger'
      logger.setLevel 1 # enable errors
      logger.useColors false

      consoleSpy = spyOn console, 'log'


    it 'should resolve relative basePath to config directory', ->
      config = e.parseConfig '/home/config1.js'
      expect(config.basePath).toBe resolveWinPath('/home/base')


    it 'should keep absolute basePath', ->
      config = e.parseConfig '/home/config2.js'
      expect(config.basePath).toBe resolveWinPath('/abs/base')


    it 'should resolve all file patterns', ->
      config = e.parseConfig '/home/config3.js'
      actual = [resolveWinPath('/home/one.js'), resolveWinPath('/home/sub/two.js')]
      expect(config.files).toEqual actual


    it 'should keep absolute url file patterns', ->
      config = e.parseConfig '/conf/absolute.js'
      expect(config.files).toEqual ['http://some.com', 'https://more.org/file.js']


    it 'should resolve all exclude patterns', ->
      config = e.parseConfig '/conf/exclude.js'
      actual = [resolveWinPath('/conf/one.js'), resolveWinPath('/conf/sub/two.js')]
      expect(config.exclude).toEqual actual


    it 'should log error and exit if file does not exist', ->
      e.parseConfig '/conf/not-exist.js'
      expect(consoleSpy).toHaveBeenCalledWith 'error (config): Config file does not exist!'
      expect(mocks.process.exit).toHaveBeenCalledWith 1


    it 'should log error and exit if it is a directory', ->
      e.parseConfig '/conf'
      expect(consoleSpy).toHaveBeenCalledWith 'error (config): Config file does not exist!'
      expect(mocks.process.exit).toHaveBeenCalledWith 1


    it 'should throw and log error if invalid file', ->
      e.parseConfig '/conf/invalid.js'
      expect(consoleSpy).toHaveBeenCalledWith 'error (config): Syntax error in config file!\n' +
        'Unexpected token ='
      expect(mocks.process.exit).toHaveBeenCalledWith 1


    it 'should override config with given cli options', ->
      config = e.parseConfig '/home/config4.js', {port: 456, autoWatch: false}

      expect(config.port).toBe 456
      expect(config.autoWatch).toBe false
      expect(config.basePath).toBe resolveWinPath('/abs/base')


    it 'should resolve files and excludes to overriden basePath from cli', ->
      config = e.parseConfig '/conf/both.js', {port: 456, autoWatch: false, basePath: '/xxx'}

      expect(config.basePath).toBe resolveWinPath('/xxx')
      actual = [resolveWinPath('/xxx/one.js'), resolveWinPath('/xxx/two.js')]
      expect(config.files).toEqual actual
      expect(config.exclude).toEqual [resolveWinPath('/xxx/third.js')]


    it 'should return only config, no globals', ->
      config = e.parseConfig '/home/config1.js', {port: 456}

      expect(config.port).toBe 456
      expect(config.basePath).toBe resolveWinPath('/home/base')

      # defaults
      expect(config.files).toEqual []
      expect(config.exclude).toEqual []
      expect(config.logLevel).toBeDefined()
      expect(config.autoWatch).toBe false
      expect(config.reporters).toEqual ['progress']
      expect(config.singleRun).toBe false
      expect(config.browsers).toEqual []
      expect(config.reportSlowerThan).toBe 0
      expect(config.captureTimeout).toBe 60000
      expect(config.proxies).toEqual {}

      expect(config.LOG_DISABLE).toBeUndefined()
      expect(config.JASMINE).toBeUndefined()
      expect(config.console).toBeUndefined()
      expect(config.require).toBeUndefined()


    it 'should export __filename and __dirname of the config file in the config context', ->
      config = e.parseConfig '/home/config5.js'
      expect(config.port.f).toBe '/home/config5.js'
      expect(config.port.d).toBe '/home'


    it 'should normalize urlRoot config', ->
      config = normalizeConfigWithDefaults {urlRoot: ''}
      expect(config.urlRoot).toBe '/'

      config = normalizeConfigWithDefaults {urlRoot: '/a/b'}
      expect(config.urlRoot).toBe '/a/b/'

      config = normalizeConfigWithDefaults {urlRoot: 'a/'}
      expect(config.urlRoot).toBe '/a/'

      config = normalizeConfigWithDefaults {urlRoot: 'some/thing'}
      expect(config.urlRoot).toBe '/some/thing/'


    it 'should change autoWatch to false if singleRun', ->
      # config4.js has autoWatch = true
      config = m.parseConfig '/home/config4.js', {singleRun: true}
      expect(config.autoWatch).toBe false


    it 'should normalize reporters to an array', ->
      config = m.parseConfig '/home/config6.js', {}
      expect(config.reporters).toEqual ['junit']


    it 'should compile coffeescript config', ->
      config = e.parseConfig '/conf/coffee.coffee', {}
      expect(config.files).toEqual [resolveWinPath('/conf/one.js'), resolveWinPath('/conf/two.js')]


    it 'should set defaults with coffeescript', ->
      config = e.parseConfig '/conf/coffee.coffee', {}
      expect(config.autoWatch).toBe false


  describe 'normalizeConfig', ->
    it 'should resolve junitReporter.outputFile to basePath and CWD', ->
      config = normalizeConfigWithDefaults
        basePath: '/some/base'
        junitReporter: {outputFile: 'file.xml'}
      expect(config.junitReporter.outputFile).toBe '/some/base/file.xml'

