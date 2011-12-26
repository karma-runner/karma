#=============================================================================
# HELPER - load module with mocking dependencies + accessing private state
#=============================================================================
vm = require 'vm'
fs = require 'fs'
fsMock = require '../mock/fs'

loadFile = (file, mocks = {}) ->
  context =
    require: (name) ->
      mocks[name] or require name
    console: console
    exports: {}
    module: {}

  vm.runInNewContext (fs.readFileSync file), context
  context

#=============================================================================
# parsing configuration - get list of real files
#=============================================================================
describe 'config', ->
  finished = null
  mocks = {}

  # create instance of fs mock
  mocks.fs = fsMock.create
    bin:
      sub:
        'one.js'  : 1
        'two.js'  : 1
        'log.txt' : 1
      mod:
        'one.js'  : 1
        'test.xml': 1
      'file.js' : 1
      'some.txt': 1
      'more.js' : 1
    home:
      '.vojta'  : 1

  # load file under test
  m = loadFile __dirname + '/../../lib/config.js', mocks

  # helper for async testing
  waitForFinished = (count = 1, name = 'resolving') ->
    waitsFor (-> finished == count), name, 100

  # reset async counter before each spec
  beforeEach ->
    finished = 0


  #=============================================================================
  # resolveSinglePattern()
  # should parse one pattern and return array of matched files
  #=============================================================================
  describe 'resolveSinglePattern', ->
    it 'should resolve basic file expression', ->
      m.resolveSinglePattern '/bin/file.js', (err, files) ->
        expect(files).toEqual ['/bin/file.js']
        expect(err).toBeFalsy()
        finished++
      waitForFinished()

    it 'should resolve non-existing file to empty array', ->
      m.resolveSinglePattern '/bin/non/existing.file', (err, files) ->
        expect(files).toEqual []
        expect(err).toBeFalsy()
        finished++
      waitForFinished()
    
    it 'should resolve *.ext pattern', ->
      m.resolveSinglePattern '/bin/*.js', (err, files) ->
        expect(files).toContain '/bin/file.js'
        expect(files).toContain '/bin/more.js'
        finished++
      waitForFinished()

    it 'should resolve /*/file pattern', ->
      m.resolveSinglePattern '/bin/*/one.js', (err, files) ->
        expect(files).toContain '/bin/sub/one.js'
        expect(files).toContain '/bin/mod/one.js'
        finished++
      waitForFinished()

    it 'should resolve complex pattern', ->
      m.resolveSinglePattern '/bin/*/*.js', (err, files) ->
        expect(files).toContain '/bin/sub/one.js'
        expect(files).toContain '/bin/sub/two.js'
        expect(files).toContain '/bin/mod/one.js'
        finished++
      waitForFinished()
  
  #=============================================================================
  # resolve() match array of patterns and returns array of uniqued matched files
  #=============================================================================
  describe 'resolve', ->
     it 'should match multiple patterns', ->
       m.resolve [
         'sub/*.txt'
         '*/*.xml'
         'more.js'
       ], '/bin', (err, files) ->
         expect(err).toBeFalsy()
         expect(files).toContain '/bin/sub/log.txt'
         expect(files).toContain '/bin/mod/test.xml'
         expect(files).toContain '/bin/more.js'
         finished++
       waitForFinished()

     it 'should remove duplicities', ->
       m.resolve [
         'sub/*.js'
         '*/one.js'
       ], '/bin', (err, files) ->
         # /bin/sub/one.js, /bin/sub/two.js, /bin/mod/one.js
         expect(files.length).toBe 3
         finished++
       waitForFinished()
     
