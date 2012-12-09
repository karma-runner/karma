#==============================================================================
# lib/file-list.js module
#==============================================================================
describe 'file-list', ->
  util = require '../test-util'
  mocks = require 'mocks'
  events = require 'events'
  path = require 'path'
  config = require '../../lib/config'

  m = list = emitter = onFileListModifiedSpy = fileListModifiedPromise = preprocessMock = null

  mockGlob = mocks.glob.create
    '/some/*.js': ['/some/a.js', '/some/b.js']
    '*.txt':      ['/c.txt', '/a.txt', '/b.txt']
    '*.js':       ['/folder', '/folder/x.js']
    '/a.*':       ['/a.txt']

  mockFs = mocks.fs.create
    some:
      '0.js': mocks.fs.file '2012-04-04'
      'a.js': mocks.fs.file '2012-04-04'
      'b.js': mocks.fs.file '2012-05-05'
    folder:
      'x.js': mocks.fs.file 0
    'a.txt': mocks.fs.file 0
    'b.txt': mocks.fs.file 0
    'c.txt': mocks.fs.file 0
    'a.js':  mocks.fs.file '2012-01-01'


  pathsFrom = (files) ->
    files.map (file) -> file.path


  findFile = (path, files) ->
    found = null
    files.forEach (file) ->
      found = file if file.path is path and found is null
    throw new Error "Files do not contain '#{path}'" if found is null
    found


  # create an array of pattern objects from given strings
  patterns = (strings...) ->
    new config.Pattern(str) for str in strings


  waitForRefreshAnd = (resume) ->
    done = false
    list.refresh().then (files) ->
      done = true
      resume files
    waitsFor (-> done), 'refresh promise resolved', 100


  beforeEach util.disableLogger

  beforeEach ->
    mocks_ = glob: mockGlob, fs: mockFs, minimatch: require('minimatch')
    globals_ =
      setTimeout: (fn, tm) -> jasmine.Clock.installed.setTimeout fn, tm
      clearTimeout: (id) -> jasmine.Clock.installed.clearTimeout id

    m = mocks.loadFile __dirname + '/../../lib/file-list.js', mocks_, globals_

    onFileListModifiedSpy = jasmine.createSpy 'onFileListModified'
    emitter = new events.EventEmitter
    emitter.on 'file_list_modified', onFileListModifiedSpy

    preprocessMock = jasmine.createSpy('preprocess').andCallFake (file, done) ->
      process.nextTick done


  #============================================================================
  # List.refresh()
  #============================================================================
  describe 'refresh', ->

    it 'should resolve patterns, keeping the order', ->
      mocks.predictableNextTick.pattern = [1, 0]
      list = new m.List patterns('/some/*.js', '*.txt'), [], null, preprocessMock

      waitForRefreshAnd ->
        expect(list.buckets.length).toBe 2
        # first bucket == first pattern (even though callbacks were reversed)
        expect(pathsFrom list.buckets[0]).toContain '/some/a.js', '/some/b.js'
        expect(pathsFrom list.buckets[1]).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should ignore directories', ->
      list = new m.List patterns('*.js'), [], null, preprocessMock

      waitForRefreshAnd ->
        expect(pathsFrom list.buckets[0]).toContain '/folder/x.js'
        expect(pathsFrom list.buckets[0]).not.toContain '/folder/'


    it 'should set mtime for every file', ->
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      waitForRefreshAnd ->
        expect(findFile('/some/a.js', list.buckets[0]).mtime).toEqual new Date '2012-04-04'
        expect(findFile('/some/b.js', list.buckets[0]).mtime).toEqual new Date '2012-05-05'


    it 'should ignore files matching excludes', ->
      list = new m.List patterns('*.txt'), ['/a.*', '**/b.txt'], null, preprocessMock

      waitForRefreshAnd ->
        expect(pathsFrom list.buckets[0]).toContain '/c.txt'
        expect(pathsFrom list.buckets[0]).not.toContain '/a.txt'
        expect(pathsFrom list.buckets[0]).not.toContain '/b.txt'


    it 'should not glob urls and set isUrl flag', ->
      list = new m.List patterns('http://some.com'), []

      waitForRefreshAnd ->
        expect(findFile('http://some.com', list.buckets[0]).isUrl).toBe true


    it 'should preprocess all files', ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      waitForRefreshAnd ->
        expect(preprocessMock).toHaveBeenCalled()
        expect(preprocessMock.callCount).toBe 2


    it 'should return a promise with list of files', ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      waitForRefreshAnd ->
        expect(files.included).toBeDefined()
        expect(files.served).toBeDefined()


  #============================================================================
  # List.reload()
  #============================================================================
  describe 'reload', ->

    it 'should reload the patterns and return promise', ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock
      done = false

      waitForRefreshAnd ->
        # MATCH /c.txt, /a.txt, /b.txt
        list.reload(patterns('*.txt'), []).then (files) ->
          expect(files.included).toBeDefined()
          expect(files.served).toBeDefined()
          expect(pathsFrom files.served).toEqual ['/a.txt', '/b.txt', '/c.txt']
          done = true

      waitsFor (-> done), 'reload promise resolving', 100


  #============================================================================
  # List.getServedFiles()
  #============================================================================
  describe 'getServedFiles', ->
    # this method does not exist anymore, results are returned as a promise

    it 'should return flat array of resolved files', ->
      list = new m.List patterns('*.txt'), [], null, preprocessMock

      waitForRefreshAnd (files) ->
        expect(files.served.length).toBe 3
        expect(pathsFrom files.served).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should return unique set', ->
      list = new m.List patterns('/a.*', '*.txt'), [], null, preprocessMock

      waitForRefreshAnd (files) ->
        expect(files.served.length).toBe 3
        expect(pathsFrom files.served).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should sort files within buckets and keep order of patterns (buckets)', ->
      # /a.*       => /a.txt                   [MATCH in *.txt as well]
      # /some/*.js => /some/a.js, /some/b.js   [/some/b.js EXCLUDED]
      # *.txt      => /c.txt, a.txt, b.txt     [UNSORTED]
      list = new m.List patterns('/a.*', '/some/*.js', '*.txt'), ['**/b.js'], null, preprocessMock

      waitForRefreshAnd (files) ->
        expect(pathsFrom files.served).toEqual ['/a.txt', '/some/a.js', '/b.txt', '/c.txt']


    it 'should return only served files', ->
      # /a.*       => /a.txt                   [served TRUE]
      # /some/*.js => /some/a.js, /some/b.js   [served FALSE]
      files = [new config.Pattern('/a.*', true), new config.Pattern('/some/*.js', false)]
      list = new m.List files, [], null, preprocessMock

      waitForRefreshAnd (files) ->
        expect(pathsFrom files.served).toEqual ['/a.txt']

  #============================================================================
  # List.getIncludedFiles()
  #============================================================================
  describe 'getIncludedFiles', ->
    # this method does not exist anymore, results are returned as a promise

    it 'should return flat array of included files', ->
      # /a.*       => /a.txt                   [included FALSE]
      # /some/*.js => /some/a.js, /some/b.js   [included TRUE]
      files = [new config.Pattern('/a.*', true, false), new config.Pattern('/some/*.js')]
      list = new m.List files, [], null, preprocessMock

      waitForRefreshAnd (files) ->
        expect(pathsFrom files.included).not.toContain '/a.txt'
        expect(pathsFrom files.included).toEqual ['/some/a.js', '/some/b.js']


  #============================================================================
  # List.addFile()
  #============================================================================
  describe 'addFile', ->

    waitForAddingFile = (path, resume) ->
      done = 0
      listModPromise = null
      emitter.once 'file_list_modified', (promise) ->
        listModPromise = promise

      list.addFile path, ->
        if listModPromise
          done = 1
          listModPromise.then (files) ->
            resume files
            done = 2
        else
          resume null
          done = 2

      waitsFor (-> done >= 1), 'addFile done callback', 100
      waitsFor (-> done is 2), 'addFile promise resolving', 100


    it 'should add the file to correct position (bucket)', ->
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd (files) ->
        expect(pathsFrom files.served).toEqual ['/some/a.js', '/some/b.js', '/a.txt']

        waitForAddingFile '/a.js', (files) ->
          expect(pathsFrom files.served).toEqual ['/some/a.js', '/some/b.js', '/a.js', '/a.txt']

          waitForAddingFile '/some/0.js', (files) ->
            expect(pathsFrom files.served).toEqual ['/some/0.js', '/some/a.js', '/some/b.js', '/a.js', '/a.txt']


    it 'should fire "file_list_modified" and pass a promise', ->
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', (files) ->
          expect(onFileListModifiedSpy).toHaveBeenCalled()
          expect(files).toBeDefined()


    it 'should not add excluded file (and not fire event)', ->
      list = new m.List patterns('/some/*.js', '/a.*'), ['/*.js'], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should not add file (neither fire event) if file already in the list', ->
      # chokidar on fucking windows might fire the event multiple times
      # and we want to ignore initial adding as well
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForAddingFile '/some/a.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should set proper mtime of new file', ->
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', (files) ->
          expect(findFile('/a.js', files.served).mtime).toEqual new Date '2012-01-01'


    it 'should preprocess added file', ->
      # MATCH: /a.txt
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        preprocessMock.reset()
        waitForAddingFile '/a.js', ->
          expect(preprocessMock).toHaveBeenCalled()
          expect(preprocessMock.argsForCall[0][0].originalPath).toBe '/a.js'


  #============================================================================
  # List.changeFile()
  #============================================================================
  describe 'changeFile', ->

    waitForChangingFile = (path, resume) ->
      done = 0
      listModPromise = null
      emitter.once 'file_list_modified', (promise) ->
        listModPromise = promise

      list.changeFile path, ->
        if listModPromise
          done = 1
          listModPromise.then (files) ->
            resume files
            done = 2
        else
          resume null
          done = 2

      waitsFor (-> done >= 1), 'changeFile done callback', 100
      waitsFor (-> done is 2), 'changeFile promise resolving', 100


    it 'should update mtime and fire "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile '/some/b.js', (files) ->
          expect(onFileListModifiedSpy).toHaveBeenCalled()
          expect(findFile('/some/b.js', files.served).mtime).toEqual new Date '2020-01-01'


    it 'should not fire "file_list_modified" if no matching file', ->
      # MATCH: /some/a.js
      list = new m.List patterns('/some/*.js', '/a.*'), ['/some/b.js'], emitter, preprocessMock

      waitForRefreshAnd ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should not fire "file_list_modified" if mtime has not changed', ->
      # chokidar on fucking windows sometimes fires event multiple times
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        # not touching the file, stat will return still the same
        waitForChangingFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    # WIN
    it 'should remove file if ENOENT stat', ->
      # chokidar fires "change" instead of remove, on windows
      # MATCH: /a.txt
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        list.getServedFiles()[0].originalPath = '/non-existing-file'
        waitForChangingFile '/non-existing-file', (files) ->
          expect(files.served).toEqual []
          expect(onFileListModifiedSpy).toHaveBeenCalled()


    it 'should preprocess changed file', ->
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        preprocessMock.reset()
        mockFs._touchFile '/some/a.js', '2020-01-01'
        waitForChangingFile '/some/a.js', ->
          expect(preprocessMock).toHaveBeenCalled()
          expect(preprocessMock.argsForCall[0][0].path).toBe '/some/a.js'


  #============================================================================
  # List.removeFile()
  #============================================================================
  describe 'removeFile', ->

    waitForRemovingFile = (path, resume) ->
      done = 0
      waitsFor (-> done >= 1), 'removeFile done callback', 100
      waitsFor (-> done is 2), 'removeFile promise resolving', 100

      listModPromise = null
      emitter.once 'file_list_modified', (promise) ->
        listModPromise = promise

      list.removeFile path, ->
        if listModPromise
          done = 1
          listModPromise.then (files) ->
            resume files
            done = 2
        else
          resume null
          done = 2


    it 'should remove file from list and fire "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForRemovingFile '/some/a.js', (files) ->
          expect(pathsFrom files.served).toEqual ['/some/b.js', '/a.txt']
          expect(onFileListModifiedSpy).toHaveBeenCalled();


    it 'should not fire "file_list_modified" if file is not in the list', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      waitForRefreshAnd ->
        waitForRemovingFile '/a.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled();


  it 'should batch multiple changes within an interval', ->
    jasmine.Clock.useMock()

    # MATCH: /some/a.js, /some/b.js, /a.txt
    list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock, 1000
    done = 0

    waitForRefreshAnd ->
      onFileListModifiedSpy.andCallFake (promise) ->
        promise.then (files) ->
          expect(pathsFrom files.served).toEqual ['/some/0.js', '/some/b.js', '/a.txt']
          done = 1

      mockFs._touchFile '/some/b.js', '2020-01-01'
      list.changeFile '/some/b.js'
      list.removeFile '/some/a.js' # /some/b.js, /a.txt
      list.removeFile '/a.txt' # /some/b.js
      list.addFile '/a.txt' # /some/b.js, /a.txt
      list.addFile '/some/0.js' # /some/0.js, /some/b.js, /a.txt

      expect(onFileListModifiedSpy).toHaveBeenCalled()
      process.nextTick -> process.nextTick ->
        jasmine.Clock.tick 1001

    waitsFor (-> done >= 1), 'resolving the 1st promise', 200
    runs ->
      expect(onFileListModifiedSpy).toHaveBeenCalled()
      expect(onFileListModifiedSpy.callCount).toBe 1

      # another batch, should fire new "file_list_modified" event
      onFileListModifiedSpy.reset()
      onFileListModifiedSpy.andCallFake (promise) ->
        promise.then (files) ->
          expect(pathsFrom files.served).toEqual ['/some/b.js', '/a.txt']
          done = 2

      list.removeFile '/some/0.js' # /some/b.js, /a.txt
      process.nextTick -> process.nextTick ->
        jasmine.Clock.tick 1001

    waitsFor (-> done is 2), 'resolving the 2nd promise', 200
    runs ->
      expect(onFileListModifiedSpy).toHaveBeenCalled()


  describe 'createWinGlob', ->

    it 'should path separator is slash', ->
      mockGlob = (pattern, opts, done) ->
        expect(pattern).toBe 'x:/Users/vojta/*.js'
        # for Travis test
        results = [
          path.join('x:', 'Users', 'vojta', 'file.js'),
          path.join('x:', 'Users', 'vojta', 'more.js')
        ]
        done null, results

      winGlob = m.createWinGlob mockGlob

      winGlob 'x:/Users/vojta/*.js', {}, (err, results) ->
        expect(results).toEqual ['x:/Users/vojta/file.js', 'x:/Users/vojta/more.js']
