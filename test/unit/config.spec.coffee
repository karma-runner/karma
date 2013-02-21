#==============================================================================
# lib/config.js module
#==============================================================================
describe 'config', ->
  fsMock = require('mocks').fs
  loadFile = require('mocks').loadFile
  mocks = m = e = null
  path = require('path')
  helper = require('../../lib/helper')

  resolveWinPath = (p) -> helper.normalizeWinPath(path.resolve(p))

  normalizeConfigWithDefaults = (cfg) ->
    cfg.urlRoot = '' if not cfg.urlRoot
    cfg.files = [] if not cfg.files
    cfg.exclude = [] if not cfg.exclude
    cfg.junitReporter = {} if not cfg.junitReporter
    cfg.coverageReporter = {} if not cfg.coverageReporter
    m.normalizeConfig cfg

  # extract only pattern properties from list of pattern objects
  patternsFrom = (list) ->
    list.map (pattern) -> pattern.pattern

  beforeEach ->
    # create instance of fs mock
    mocks = {}
    mocks.process = exit: sinon.spy()
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
        'config7.js': fsMock.file 0, 'browsers = ["Chrome", "Firefox"];'
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
    logSpy = null

    beforeEach ->
      logSpy = sinon.spy()

      logger = require '../../lib/logger.js'
      logger.setup 'ERROR', false

      logger.create('config').on 'log', logSpy


    it 'should resolve relative basePath to config directory', ->
      config = e.parseConfig '/home/config1.js', {}
      expect(config.basePath).to.equal resolveWinPath('/home/base')


    it 'should keep absolute basePath', ->
      config = e.parseConfig '/home/config2.js', {}
      expect(config.basePath).to.equal resolveWinPath('/abs/base')


    it 'should resolve all file patterns', ->
      config = e.parseConfig '/home/config3.js', {}
      actual = [resolveWinPath('/home/one.js'), resolveWinPath('/home/sub/two.js')]
      expect(patternsFrom config.files).to.deep.equal actual


    it 'should keep absolute url file patterns', ->
      config = e.parseConfig '/conf/absolute.js', {}
      expect(patternsFrom config.files).to.deep.equal ['http://some.com', 'https://more.org/file.js']


    it 'should resolve all exclude patterns', ->
      config = e.parseConfig '/conf/exclude.js', {}
      actual = [resolveWinPath('/conf/one.js'), resolveWinPath('/conf/sub/two.js')]
      expect(config.exclude).to.deep.equal actual


    it 'should log error and exit if file does not exist', ->
      e.parseConfig '/conf/not-exist.js', {}

      expect(logSpy).to.have.been.called
      event = logSpy.lastCall.args[0]
      expect(event.level.toString()).to.be.equal 'ERROR'
      expect(event.data).to.be.deep.equal ['Config file does not exist!']
      expect(mocks.process.exit).to.have.been.calledWith 1


    it 'should log error and exit if it is a directory', ->
      e.parseConfig '/conf', {}

      expect(logSpy).to.have.been.called
      event = logSpy.lastCall.args[0]
      expect(event.level.toString()).to.be.equal 'ERROR'
      expect(event.data).to.be.deep.equal ['Config file does not exist!']
      expect(mocks.process.exit).to.have.been.calledWith 1


    it 'should throw and log error if invalid file', ->
      e.parseConfig '/conf/invalid.js', {}

      expect(logSpy).to.have.been.called
      event = logSpy.lastCall.args[0]
      expect(event.level.toString()).to.be.equal 'ERROR'
      expect(event.data).to.be.deep.equal ['Syntax error in config file!\nUnexpected token =']
      expect(mocks.process.exit).to.have.been.calledWith 1


    it 'should override config with given cli options', ->
      config = e.parseConfig '/home/config4.js', {port: 456, autoWatch: false}

      expect(config.port).to.equal 456
      expect(config.autoWatch).to.equal false
      expect(config.basePath).to.equal resolveWinPath('/abs/base')


    it 'should override config with cli options, but not deep merge', ->
      # regression https://github.com/vojtajina/testacular/issues/283
      config = e.parseConfig '/home/config7.js', {browsers: ['Safari']}

      expect(config.browsers).to.deep.equal ['Safari']


    it 'should resolve files and excludes to overriden basePath from cli', ->
      config = e.parseConfig '/conf/both.js', {port: 456, autoWatch: false, basePath: '/xxx'}

      expect(config.basePath).to.equal resolveWinPath('/xxx')
      actual = [resolveWinPath('/xxx/one.js'), resolveWinPath('/xxx/two.js')]
      expect(patternsFrom config.files).to.deep.equal actual
      expect(config.exclude).to.deep.equal [resolveWinPath('/xxx/third.js')]


    it 'should return only config, no globals', ->
      config = e.parseConfig '/home/config1.js', {port: 456}

      expect(config.port).to.equal 456
      expect(config.basePath).to.equal resolveWinPath('/home/base')

      # defaults
      expect(config.files).to.deep.equal []
      expect(config.exclude).to.deep.equal []
      expect(config.logLevel).to.exist
      expect(config.autoWatch).to.equal false
      expect(config.reporters).to.deep.equal ['progress']
      expect(config.singleRun).to.equal false
      expect(config.browsers).to.deep.equal []
      expect(config.reportSlowerThan).to.equal 0
      expect(config.captureTimeout).to.equal 60000
      expect(config.proxies).to.deep.equal {}

      expect(config.LOG_DISABLE).to.not.exist
      expect(config.JASMINE).to.not.exist
      expect(config.console).to.not.exist
      expect(config.require).to.not.exist


    it 'should export __filename and __dirname of the config file in the config context', ->
      config = e.parseConfig '/home/config5.js', {}
      expect(config.port.f).to.equal '/home/config5.js'
      expect(config.port.d).to.equal '/home'


    it 'should normalize urlRoot config', ->
      config = normalizeConfigWithDefaults {urlRoot: ''}
      expect(config.urlRoot).to.equal '/'

      config = normalizeConfigWithDefaults {urlRoot: '/a/b'}
      expect(config.urlRoot).to.equal '/a/b/'

      config = normalizeConfigWithDefaults {urlRoot: 'a/'}
      expect(config.urlRoot).to.equal '/a/'

      config = normalizeConfigWithDefaults {urlRoot: 'some/thing'}
      expect(config.urlRoot).to.equal '/some/thing/'


    it 'should change autoWatch to false if singleRun', ->
      # config4.js has autoWatch = true
      config = m.parseConfig '/home/config4.js', {singleRun: true}
      expect(config.autoWatch).to.equal false


    it 'should normalize reporters to an array', ->
      config = m.parseConfig '/home/config6.js', {}
      expect(config.reporters).to.deep.equal ['junit']


    it 'should compile coffeescript config', ->
      config = e.parseConfig '/conf/coffee.coffee', {}
      expect(patternsFrom config.files).to.deep.equal [resolveWinPath('/conf/one.js'), resolveWinPath('/conf/two.js')]


    it 'should set defaults with coffeescript', ->
      config = e.parseConfig '/conf/coffee.coffee', {}
      expect(config.autoWatch).to.equal false


    it 'should not read config file, when null', ->
      config = e.parseConfig null, {basePath: '/some'}

      expect(logSpy).not.to.have.been.called
      expect(config.basePath).to.equal '/some' # overriden by CLI
      expect(config.urlRoot).to.equal '/' # default value


  describe 'normalizeConfig', ->

    it 'should resolve junitReporter.outputFile to basePath and CWD', ->
      config = normalizeConfigWithDefaults
        basePath: '/some/base'
        junitReporter: {outputFile: 'file.xml'}
      expect(config.junitReporter.outputFile).to.equal resolveWinPath('/some/base/file.xml')


    it 'should resolve coverageReporter.dir to basePath and CWD', ->
      config = normalizeConfigWithDefaults
        basePath: '/some/base'
        coverageReporter: {dir: 'path/to/coverage'}
      expect(config.coverageReporter.dir).to.equal resolveWinPath('/some/base/path/to/coverage')


    it 'should convert patterns to objects and set defaults', ->
      config = normalizeConfigWithDefaults
        basePath: '/base'
        files: ['a/*.js', {pattern: 'b.js', watched: false, included: false}, {pattern: 'c.js'}]

      expect(config.files.length).to.equal 3

      file = config.files.shift()
      expect(file.pattern).to.equal resolveWinPath '/base/a/*.js'
      expect(file.included).to.equal true
      expect(file.served).to.equal true
      expect(file.watched).to.equal true

      file = config.files.shift()
      expect(file.pattern).to.equal resolveWinPath '/base/b.js'
      expect(file.included).to.equal false
      expect(file.served).to.equal true
      expect(file.watched).to.equal false

      file = config.files.shift()
      expect(file.pattern).to.equal resolveWinPath '/base/c.js'
      expect(file.included).to.equal true
      expect(file.served).to.equal true
      expect(file.watched).to.equal true


  describe 'createPatternObject', ->

    it 'should parse string and set defaults', ->
      pattern = m.createPatternObject 'some/**/*.js'

      expect(typeof pattern).to.equal 'object'
      expect(pattern.pattern).to.equal 'some/**/*.js'
      expect(pattern.watched).to.equal true
      expect(pattern.included).to.equal true
      expect(pattern.served).to.equal true

    it 'should merge pattern object and set defaults', ->
      pattern = m.createPatternObject {pattern: 'a.js', included: false, watched: false}

      expect(typeof pattern).to.equal 'object'
      expect(pattern.pattern).to.equal 'a.js'
      expect(pattern.watched).to.equal false
      expect(pattern.included).to.equal false
      expect(pattern.served).to.equal true


    it 'should make urls not served neither watched', ->
      pattern = m.createPatternObject 'http://some.url.com'

      expect(pattern.pattern).to.equal 'http://some.url.com'
      expect(pattern.included).to.equal true
      expect(pattern.watched).to.equal false
      expect(pattern.served).to.equal false

      pattern = m.createPatternObject {pattern: 'https://some.other.com'}

      expect(pattern.pattern).to.equal 'https://some.other.com'
      expect(pattern.included).to.equal true
      expect(pattern.watched).to.equal false
      expect(pattern.served).to.equal false
