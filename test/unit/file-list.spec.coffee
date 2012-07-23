#==============================================================================
# lib/file-list.js module
#==============================================================================
describe 'file-list', ->
  mocks = require 'mocks'
  events = require 'events'

  m = list = emitter = onFileListModifiedSpy = null

  mockGlob = mocks.glob.create
    '/some/*.js': ['/some/a.js', '/some/b.js']
    '*.txt': ['/c.txt', '/a.txt', '/b.txt']
    '*.js': ['/folder', '/folder/x.js']
    '/a.*': ['/a.txt']

  mockFs = mocks.fs.create
    some:
      '0.js': mocks.fs.file '2012-04-04'
      'a.js':   mocks.fs.file '2012-04-04'
      'b.js':   mocks.fs.file '2012-05-05'
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


  waitForRefreshAnd = (resume) ->
    done = jasmine.createSpy 'done'
    list.refresh done
    waitsFor (-> done.callCount), 'refresh done callback', 100
    runs resume


  beforeEach ->
    mocks_ = glob: mockGlob, fs: mockFs, minimatch: require('minimatch')
    m = mocks.loadFile __dirname + '/../../lib/file-list.js', mocks_

    onFileListModifiedSpy = jasmine.createSpy 'onFileListModified'
    emitter = new events.EventEmitter
    emitter.on 'file_list_modified', onFileListModifiedSpy


  #============================================================================
  # List.refresh()
  #============================================================================
  describe 'refresh', ->

    it 'should resolve patterns, keeping the order', ->
      mocks.predictableNextTick.pattern = [1, 0]
      list = new m.List ['/some/*.js', '*.txt'], []

      waitForRefreshAnd ->
        expect(list.buckets.length).toBe 2
        # first bucket == first pattern (even though callbacks were reversed)
        expect(pathsFrom list.buckets[0]).toContain '/some/a.js', '/some/b.js'
        expect(pathsFrom list.buckets[1]).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should ignore directories', ->
      list = new m.List ['*.js'], []

      waitForRefreshAnd ->
        expect(pathsFrom list.buckets[0]).toContain '/folder/x.js'
        expect(pathsFrom list.buckets[0]).not.toContain '/folder/'


    it 'should set mtime for every file', ->
      list = new m.List ['/some/*.js'], []

      waitForRefreshAnd ->
        expect(findFile('/some/a.js', list.buckets[0]).mtime).toEqual new Date '2012-04-04'
        expect(findFile('/some/b.js', list.buckets[0]).mtime).toEqual new Date '2012-05-05'


    it 'should ignore files matching excludes', ->
      list = new m.List ['*.txt'], ['/a.*', '**/b.txt']

      waitForRefreshAnd ->
        expect(pathsFrom list.buckets[0]).toContain '/c.txt'
        expect(pathsFrom list.buckets[0]).not.toContain '/a.txt'
        expect(pathsFrom list.buckets[0]).not.toContain '/b.txt'


    it 'should not glob urls and set isUrl flag', ->
      list = new m.List ['http://some.com'], []

      waitForRefreshAnd ->
        expect(findFile('http://some.com', list.buckets[0]).isUrl).toBe true


  #============================================================================
  # List.getFiles()
  #============================================================================
  describe 'getFiles', ->

    it 'should return flat array of resolved files', ->
      list = new m.List ['*.txt'], []

      waitForRefreshAnd ->
        files = list.getFiles()
        expect(files.length).toBe 3
        expect(pathsFrom files).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should return unique set', ->
      list = new m.List ['/a.*', '*.txt'], []

      waitForRefreshAnd ->
        files = list.getFiles()
        expect(files.length).toBe 3
        expect(pathsFrom files).toContain '/a.txt', '/b.txt', '/c.txt'


    it 'should sort files within buckets and keep order of patterns (buckets)', ->
      # /a.*       => /a.txt                   [MATCH in *.txt as well]
      # /some/*.js => /some/a.js, /some/b.js   [/some/b.js EXCLUDED]
      # *.txt      => /c.txt, a.txt, b.txt     [UNSORTED]
      list = new m.List ['/a.*', '/some/*.js', '*.txt'], ['**/b.js']

      waitForRefreshAnd ->
        files = list.getFiles()
        expect(pathsFrom files).toEqual ['/a.txt', '/some/a.js', '/b.txt', '/c.txt']


  #============================================================================
  # List.addFile()
  #============================================================================
  describe 'addFile', ->

    waitForAddingFile = (path, resume) ->
      done = jasmine.createSpy 'done'
      list.addFile path, done
      waitsFor (-> done.callCount), 'addFile done callback', 100
      runs resume


    it 'should add the file to correct position (bucket)', ->
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        expect(pathsFrom list.getFiles()).toEqual ['/some/a.js', '/some/b.js', '/a.txt']

        waitForAddingFile '/a.js', ->
          expect(pathsFrom list.getFiles()).toEqual ['/some/a.js', '/some/b.js', '/a.js', '/a.txt']

          waitForAddingFile '/some/0.js', ->
            expect(pathsFrom list.getFiles()).toEqual ['/some/0.js', '/some/a.js', '/some/b.js', '/a.js', '/a.txt']


    it 'should fire "file_list_modified"', ->
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', ->
          expect(onFileListModifiedSpy).toHaveBeenCalled()


    it 'should not add excluded file (and not fire event)', ->
      list = new m.List ['/some/*.js', '/a.*'], ['/*.js'], emitter

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should not add file (neither fire event) if file already in the list', ->
      # chokidar on fucking windows might fire the event multiple times
      # and we want to ignore initial adding as well
      # MATCH: /some/a.js, /some/b.js
      list = new m.List ['/some/*.js'], [], emitter

      waitForRefreshAnd ->
        waitForAddingFile '/some/a.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should set proper mtime of new file', ->
      list = new m.List ['/a.*'], [], emitter

      waitForRefreshAnd ->
        waitForAddingFile '/a.js', ->
          expect(findFile('/a.js', list.getFiles()).mtime).toEqual new Date '2012-01-01'


  #============================================================================
  # List.changeFile()
  #============================================================================
  describe 'changeFile', ->

    waitForChangingFile = (path, resume) ->
      done = jasmine.createSpy 'done'
      list.changeFile path, done
      waitsFor (-> done.callCount), 'changeFile done callback', 100
      runs resume


    it 'should update mtime and fire "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile '/some/b.js', ->
          expect(onFileListModifiedSpy).toHaveBeenCalled()
          expect(findFile('/some/b.js', list.getFiles()).mtime).toEqual new Date '2020-01-01'


    it 'should not fire "file_list_modified" if no matching file', ->
      # MATCH: /some/a.js
      list = new m.List ['/some/*.js', '/a.*'], ['/some/b.js'], emitter

      waitForRefreshAnd ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


    it 'should not fire "file_list_modified" if mtime has not changed', ->
      # chokidar on fucking windows sometimes fires event multiple times
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        # not touching the file, stat will return still the same
        waitForChangingFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.toHaveBeenCalled()


  #============================================================================
  # List.removeFile()
  #============================================================================
  describe 'removeFile', ->

    waitForRemovingFile = (path, resume) ->
      done = jasmine.createSpy 'done'
      list.removeFile path, done
      waitsFor (-> done.callCount), 'removeFile done callback', 100
      runs resume


    it 'should remove file from list and fire "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        waitForRemovingFile '/some/a.js', ->
          expect(pathsFrom list.getFiles()).toEqual ['/some/b.js', '/a.txt']
          expect(onFileListModifiedSpy).toHaveBeenCalled();


    it 'should not fire "file_list_modified" if file is not in the list', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List ['/some/*.js', '/a.*'], [], emitter

      waitForRefreshAnd ->
        waitForRemovingFile '/a.js', ->
          expect(pathsFrom list.getFiles()).toEqual ['/some/a.js', '/some/b.js', '/a.txt']
          expect(onFileListModifiedSpy).not.toHaveBeenCalled();
