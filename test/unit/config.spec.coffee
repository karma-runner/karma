#==============================================================================
# lib/config.js module
#==============================================================================
describe 'config', ->
  util = require '../test-util.js'
  fsMock = require('mocks').fs
  loadFile = require('mocks').loadFile
  mocks = m = e = null

  beforeEach util.disableLogger

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
        'config1.js': fsMock.file 0, 'basePath = "base"'
        'config2.js': fsMock.file 0, 'basePath = "/abs/base"'
        'config3.js': fsMock.file 0, 'files = ["one.js", "sub/two.js"];'
        'config4.js': fsMock.file 0, 'port = 123; autoWatch = true; basePath = "/abs/base"'
      conf:
        'invalid.js': fsMock.file 0, '={function'
        'exclude.js': fsMock.file 0, 'exclude = ["one.js", "sub/two.js"];'
        'absolute.js': fsMock.file 0, 'files = ["http://some.com", "https://more.org/file.js"];'

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
      require('../../lib/logger').setLevel 1 # enable errors
      consoleSpy = spyOn(console, 'log')


    it 'should resolve relative basePath to config directory', ->
      config = e.parseConfig '/home/config1.js'
      expect(config.basePath).toBe '/home/base'


    it 'should keep absolute basePath', ->
      config = e.parseConfig '/home/config2.js'
      expect(config.basePath).toBe '/abs/base'


    it 'should resolve all file patterns', ->
      config = e.parseConfig '/home/config3.js'
      expect(config.files).toEqual ['/home/one.js', '/home/sub/two.js']


    it 'should keep absolute url file patterns', ->
      config = e.parseConfig '/conf/absolute.js'
      expect(config.files).toEqual ['http://some.com', 'https://more.org/file.js']


    it 'should resolve all exclude patterns', ->
      config = e.parseConfig '/conf/exclude.js'
      expect(config.exclude).toEqual ['/conf/one.js', '/conf/sub/two.js']


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
      expect(config.basePath).toBe '/abs/base'
