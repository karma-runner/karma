#==============================================================================
# lib/config.js module
#==============================================================================
describe 'config', ->
  util = require '../test-util.js'
  fsMock = require('mocks').fs
  loadFile = require('mocks').loadFile
  events = require '../../lib/events'
  finished = mocks = m = e = null

  beforeEach util.disableLogger

  # helper for async testing
  waitForFinished = (count = 1, name = 'resolving') ->
    waitsFor (-> finished == count), name, 100

  # helper for converting array of file objects into array of strings
  stringsFrom = (files) ->
    strings = []
    files.forEach (file) ->
      strings.push file.path
    strings

  # helper to find file in array of files, based on path
  findFile = (path, files) ->
    found = null
    files.forEach (file) ->
      found = file if file.path is path and found is null
    throw new Error "Files do not contain '#{path}'" if found is null
    found

  # reset async counter before each spec
  beforeEach ->
    finished = 0

    # create instance of fs mock
    mocks = {}
    mocks.process = {exit: jasmine.createSpy 'exit'}
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

    # load file under test
    m = loadFile __dirname + '/../../lib/config.js', mocks, {process: mocks.process}
    e = m.exports


  #============================================================================
  # resolveSinglePattern()
  # Should parse one pattern and return array of matched files
  #============================================================================
  describe 'resolveSinglePattern', ->

    it 'should resolve basic file expression', ->
      m.resolveSinglePattern '/bin/file.js', (err, files) ->
        expect(stringsFrom files).toEqual ['/bin/file.js']
        expect(err).toBeFalsy()
        finished++
      waitForFinished()


    it 'should resolve non-existing file to empty array', ->
      m.resolveSinglePattern '/bin/non/existing.file', (err, files) ->
        expect(stringsFrom files).toEqual []
        expect(err).toBeFalsy()
        finished++
      waitForFinished()


    it 'should resolve *.ext pattern', ->
      m.resolveSinglePattern '/bin/*.js', (err, files) ->
        listOfPaths = stringsFrom files
        expect(listOfPaths).toContain '/bin/file.js'
        expect(listOfPaths).toContain '/bin/more.js'
        finished++
      waitForFinished()


    it 'should resolve /*/file pattern', ->
      m.resolveSinglePattern '/bin/*/one.js', (err, files) ->
        listOfPaths = stringsFrom files
        expect(listOfPaths).toContain '/bin/sub/one.js'
        expect(listOfPaths).toContain '/bin/mod/one.js'
        finished++
      waitForFinished()


    it 'should resolve complex pattern', ->
      m.resolveSinglePattern '/bin/*/*.js', (err, files) ->
        listOfPaths = stringsFrom files
        expect(listOfPaths).toContain '/bin/sub/one.js'
        expect(listOfPaths).toContain '/bin/sub/two.js'
        expect(listOfPaths).toContain '/bin/mod/one.js'
        finished++
      waitForFinished()


    it 'should sort all results by file path', ->
      # file system will call in 1, 0, 2 order
      require('mocks').predictableNextTick.pattern = [1, 0, 2]

      m.resolveSinglePattern '/bin/*/*.js', (err, files) ->
        expect(stringsFrom files).toEqual ['/bin/mod/one.js', '/bin/sub/one.js', '/bin/sub/two.js']
        finished++
      waitForFinished()


  #============================================================================
  # resolve()
  # Should match array of patterns and return an array of unique matched files
  #============================================================================
  describe 'resolve', ->

    it 'should match multiple patterns', ->
      m.resolve [
        '/bin/sub/*.txt'
        '/bin/*/*.xml'
        '/bin/more.js'
      ], [], (err, files) ->
        expect(err).toBeFalsy()
        listOfPaths = stringsFrom files
        expect(listOfPaths).toContain '/bin/sub/log.txt'
        expect(listOfPaths).toContain '/bin/mod/test.xml'
        expect(listOfPaths).toContain '/bin/more.js'
        finished++
      waitForFinished()


    it 'should remove duplicities', ->
      m.resolve [
        '/bin/sub/*.js'
        '/bin/*/one.js'
      ], [], (err, files) ->
        # /bin/sub/one.js, /bin/sub/two.js, /bin/mod/one.js
        expect(files.length).toBe 3
        finished++
      waitForFinished()


    it 'should resolve modified timestamps', ->
      m.resolve ['/bin/sub/*.js'], [], (err, files) ->
        expect(err).toBeFalsy()
        expect(findFile('/bin/sub/one.js', files).mtime).toEqual new Date '2011-12-25'
        expect(findFile('/bin/sub/two.js', files).mtime).toEqual new Date '2011-12-26'
        finished++
      waitForFinished()


    it 'should return all files sorted within single expression', ->
      m.resolve ['/home/*.js', '/bin/sub/one.js'], [], (err, files) ->
        expect(stringsFrom files).toEqual ['/home/config1.js', '/home/config2.js',
                                           '/home/config3.js', '/home/config4.js',
                                           '/bin/sub/one.js']
        finished++
      waitForFinished()


    it 'should exclude exact file', ->
      m.resolve ['/home/*.js', '/bin/sub/one.js'], ['/home/config1.js'], (err, files) ->
        expect(stringsFrom files).not.toContain '/home/config1.js'
        finished++
      waitForFinished()


    it 'should exclude all files matching given pattern', ->
      m.resolve ['/home/*.js', '/bin/sub/*.js'], ['/home/config*.js', '/bin/sub/two.js'], (err, files) ->
        listOfPaths = stringsFrom files
        expect(listOfPaths).not.toContain '/home/config1.js'
        expect(listOfPaths).not.toContain '/home/config2.js'
        expect(listOfPaths).not.toContain '/home/config3.js'
        expect(listOfPaths).not.toContain '/bin/sub/two.js'
        finished++
      waitForFinished()


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
      expect(-> e.parseConfig '/conf/invalid.js').toThrow 'Unexpected token ='
      expect(consoleSpy).toHaveBeenCalledWith 'error (config): Syntax error in config file!'


    it 'should override config with given cli options', ->
      config = e.parseConfig '/home/config4.js', {port: 456, autoWatch: false}

      expect(config.port).toBe 456
      expect(config.autoWatch).toBe false
      expect(config.basePath).toBe '/abs/base'


  #============================================================================
  # config.FileGuardian
  #============================================================================
  describe 'FileGuardian', ->

    describe 'checkModifications', ->

      it 'should update all timestamps from fs and call done with modified count', ->
        callback = jasmine.createSpy 'done'
        fg = new e.FileGuardian ['/home/*.js'], []
        waitsFor (-> fg.getFiles().length > 0), 'files loading', 100

        runs ->
          mocks.fs._touchFile '/home/config1.js', '2012-04-05', 'new-content'
          mocks.fs._touchFile '/home/config2.js', '2012-04-06', 'new-content'
          fg.checkModifications callback
          waitsFor (-> callback.callCount > 0), 'checkModifications', 100

        runs ->
          expect(callback).toHaveBeenCalledWith 2
          expect(findFile('/home/config1.js', fg.getFiles()).mtime).toEqual new Date '2012-04-05'
          expect(findFile('/home/config2.js', fg.getFiles()).mtime).toEqual new Date '2012-04-06'


    describe 'autoWatch', ->

      callback = emitter = null

      beforeEach ->
        emitter = new events.EventEmitter
        callback = jasmine.createSpy 'file modified'
        emitter.on 'file_modified', callback


      it 'should fire "fileModified" event', ->
        fg = new e.FileGuardian ['/home/*.js'], [], emitter, true
        waitsFor (-> fg.getFiles().length > 0), 'files loading', 100

        runs ->
          expect(callback).not.toHaveBeenCalled()
          mocks.fs._touchFile '/home/config1.js', '2012-04-05', 'new-content'
          expect(callback).toHaveBeenCalled()


      it 'should update timestamp', ->
        fg = new e.FileGuardian ['/home/*.js'], [], emitter, true
        waitsFor (-> fg.getFiles().length > 0), 'files loading', 100

        runs ->
          mocks.fs._touchFile '/home/config1.js', '2012-03-02'
          expect(findFile('/home/config1.js', fg.getFiles()).mtime).toEqual new Date '2012-03-02'


      it 'should not fire "file_modified" event if file not modified (only accessed)', ->
        fg = new e.FileGuardian ['/home/*.js'], [], emitter, true
        waitsFor (-> fg.getFiles().length > 0), 'files loading', 100

        runs ->
          mocks.fs._touchFile '/home/config1.js'
          expect(callback).not.toHaveBeenCalled()


      it 'should never fire "file_modified" event if autoWatch disabled', ->
        fg = new e.FileGuardian ['/home/*.js'], [], emitter, false
        waitsFor (-> fg.getFiles().length > 0), 'files loading', 100

        runs ->
          mocks.fs._touchFile '/home/config1.js'
          mocks.fs._touchFile '/home/config2.js', '2012-04-06'
          mocks.fs._touchFile '/home/config3.js', '2012-04-07', 'new-content'
          expect(callback).not.toHaveBeenCalled()
