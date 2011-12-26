#==============================================================================
# lib/config.js module
#==============================================================================
describe 'config', ->
  loadFile = require('../util').loadFile
  fsMock = require '../mock/fs'
  finished = null; mocks = {}

  # create instance of fs mock
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

  # load file under test
  m = loadFile __dirname + '/../../lib/config.js', mocks
  e = m.exports

  # helper for async testing
  waitForFinished = (count = 1, name = 'resolving') ->
    waitsFor (-> finished == count), name, 100

  # helper for converting array of file objects into array of strings
  stringsFrom = (files) ->
    strings = []
    files.forEach (file) ->
      strings.push file.path
    strings

  # reset async counter before each spec
  beforeEach ->
    finished = 0


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
        expect(stringsFrom files).toContain '/bin/file.js'
        expect(stringsFrom files).toContain '/bin/more.js'
        finished++
      waitForFinished()


    it 'should resolve /*/file pattern', ->
      m.resolveSinglePattern '/bin/*/one.js', (err, files) ->
        expect(stringsFrom files).toContain '/bin/sub/one.js'
        expect(stringsFrom files).toContain '/bin/mod/one.js'
        finished++
      waitForFinished()


    it 'should resolve complex pattern', ->
      m.resolveSinglePattern '/bin/*/*.js', (err, files) ->
        expect(stringsFrom files).toContain '/bin/sub/one.js'
        expect(stringsFrom files).toContain '/bin/sub/two.js'
        expect(stringsFrom files).toContain '/bin/mod/one.js'
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
       ], (err, files) ->
         expect(err).toBeFalsy()
         expect(stringsFrom files).toContain '/bin/sub/log.txt'
         expect(stringsFrom files).toContain '/bin/mod/test.xml'
         expect(stringsFrom files).toContain '/bin/more.js'
         finished++
       waitForFinished()


     it 'should remove duplicities', ->
       m.resolve [
         '/bin/sub/*.js'
         '/bin/*/one.js'
       ], (err, files) ->
         # /bin/sub/one.js, /bin/sub/two.js, /bin/mod/one.js
         expect(files.length).toBe 3
         finished++
       waitForFinished()


     it 'should resolve modified timestamps', ->
       m.resolve ['/bin/sub/*.js'], (err, files) ->
         expect(err).toBeFalsy()
         expect(files[0].mtime).toEqual new Date('2011-12-25')
         expect(files[1].mtime).toEqual new Date('2011-12-26')
         finished++
       waitForFinished()


  #============================================================================
  # config.parseConfig()
  # Should parse configuration file and do some basic processing as well
  #============================================================================
  describe 'parseConfig', ->

    it 'should resolve relative basePath to config directory', ->
      config = e.parseConfig '/home/config1.js'
      expect(config.basePath).toBe '/home/base'


    it 'should keep absolute basePath', ->
      config = e.parseConfig '/home/config2.js'
      expect(config.basePath).toBe '/abs/base'


    it 'should resolve all file patterns', ->
      config = e.parseConfig '/home/config3.js'
      expect(config.files).toEqual ['/home/one.js', '/home/sub/two.js']
