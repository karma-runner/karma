#==============================================================================
# lib/file-list.js module
#==============================================================================
describe 'file-list', ->
  mocks = require 'mocks'
  events = require 'events'
  path = require 'path'
  config = require '../../lib/config'
  
  onFileListModifiedSpy = mocks_ = null
  m = list = emitter = fileListModifiedPromise = preprocessMock = null

  mockGlob = mocks.glob.create
    '/some/*.js': ['/some/a.js', '/some/b.js']
    '*.txt':      ['/c.txt', '/a.txt', '/b.txt']
    '*.js':       ['/folder', '/folder/x.js']
    '/a.*':       ['/a.txt']
    # we need at least 11 elements to trigger V8's quick sort
    '**':         ['/a.txt', '/b.txt', '/c.txt', '/a.txt', '/c.txt', '/b.txt', '/a.txt', '/c.txt',
                   '/a.txt', '/a.txt', '/c.txt']

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


  beforeEach ->

    mocks_ =
      glob: mockGlob
      fs: mockFs
      minimatch: require('minimatch')

    m = mocks.loadFile __dirname + '/../../lib/file-list.js', mocks_

    onFileListModifiedSpy = sinon.spy()
    emitter = new events.EventEmitter
    emitter.on 'file_list_modified', onFileListModifiedSpy

    preprocessMock = sinon.spy((file, done) -> process.nextTick done)

  #============================================================================
  # List.refresh()
  #============================================================================
  describe 'refresh', ->

    it 'should resolve patterns, keeping the order', (done) ->
      mocks.predictableNextTick.pattern = [1, 0]
      list = new m.List patterns('/some/*.js', '*.txt'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(list.buckets.length).to.equal 2
        # first bucket == first pattern (even though callbacks were reversed)
        expect(pathsFrom list.buckets[0]).to.contain '/some/a.js', '/some/b.js'
        expect(pathsFrom list.buckets[1]).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()

    it 'should ignore directories', (done) ->
      list = new m.List patterns('*.js'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom list.buckets[0]).to.contain '/folder/x.js'
        expect(pathsFrom list.buckets[0]).not.to.contain '/folder/'
        done()

    it 'should set mtime for every file', (done) ->
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(findFile('/some/a.js', list.buckets[0]).mtime).to.deep.equal new Date '2012-04-04'
        expect(findFile('/some/b.js', list.buckets[0]).mtime).to.deep.equal new Date '2012-05-05'
        done()

    it 'should ignore files matching excludes', (done) ->
      list = new m.List patterns('*.txt'), ['/a.*', '**/b.txt'], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom list.buckets[0]).to.contain '/c.txt'
        expect(pathsFrom list.buckets[0]).not.to.contain '/a.txt'
        expect(pathsFrom list.buckets[0]).not.to.contain '/b.txt'
        done()

    it 'should not glob urls and set isUrl flag', (done) ->
      list = new m.List patterns('http://some.com'), []

      list.refresh().then (files) ->
        expect(findFile('http://some.com', list.buckets[0]).isUrl).to.equal  true
        done()


    it 'should preprocess all files', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(preprocessMock).to.have.been.called
        expect(preprocessMock.callCount).to.equal 2
        done()

    it 'should return a promise with list of files', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock
      
      list.refresh().then (files) ->
        expect(files.included).to.exist
        expect(files.served).to.exist
        done()

  #============================================================================
  # List.reload()
  #============================================================================
  describe 'reload', ->

    it 'should reload the patterns and return promise', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], null, preprocessMock

      # MATCH /c.txt, /a.txt, /b.txt
      list.reload(patterns('*.txt'), []).then (files) ->
        expect(files.included).to.exist
        expect(files.served).to.exist
        expect(pathsFrom files.served).to.deep.equal ['/a.txt', '/b.txt', '/c.txt']
        done()


  #============================================================================
  # List.getServedFiles()
  #============================================================================
  describe 'getServedFiles', ->
    # this method does not exist anymore, results are returned as a promise

    it 'should return flat array of resolved files', (done) ->
      list = new m.List patterns('*.txt'), [], null, preprocessMock
      
      list.refresh().then (files) ->
        expect(files.served.length).to.equal 3
        expect(pathsFrom files.served).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()

    it 'should return unique set', (done) ->
      list = new m.List patterns('/a.*', '*.txt'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(files.served.length).to.equal 3
        expect(pathsFrom files.served).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()

    it 'should sort files within buckets and keep order of patterns (buckets)', (done) ->
      # /a.*       => /a.txt                   [MATCH in *.txt as well]
      # /some/*.js => /some/a.js, /some/b.js   [/some/b.js EXCLUDED]
      # *.txt      => /c.txt, a.txt, b.txt     [UNSORTED]
      list = new m.List patterns('/a.*', '/some/*.js', '*.txt'), ['**/b.js'], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/a.txt', '/some/a.js', '/b.txt', '/c.txt']
        done()

    it 'should sort files within buckets (if more than 11 elements)', (done) ->
      # regression for sorting many items
      list = new m.List patterns('**'), [], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/a.txt', '/b.txt', '/c.txt']
        done()

    it 'should return only served files', (done) ->
      # /a.*       => /a.txt                   [served TRUE]
      # /some/*.js => /some/a.js, /some/b.js   [served FALSE]
      files = [new config.Pattern('/a.*', true), new config.Pattern('/some/*.js', false)]
      list = new m.List files, [], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/a.txt']
        done()

        
  #============================================================================
  # List.getIncludedFiles()
  #============================================================================
  describe 'getIncludedFiles', ->
    # this method does not exist anymore, results are returned as a promise

    it 'should return flat array of included files', (done) ->
      # /a.*       => /a.txt                   [included FALSE]
      # /some/*.js => /some/a.js, /some/b.js   [included TRUE]
      files = [new config.Pattern('/a.*', true, false), new config.Pattern('/some/*.js')]
      list = new m.List files, [], null, preprocessMock

      list.refresh().then (files) ->
        expect(pathsFrom files.included).not.to.contain '/a.txt'
        expect(pathsFrom files.included).to.deep.equal ['/some/a.js', '/some/b.js']
        done()


  #============================================================================
  # List.addFile()
  #============================================================================
  describe 'addFile', ->

    waitForAddingFile = (done, path, resume) ->
      emitter.once 'file_list_modified', (promise) ->
        expect(promise).to.be.fulfilled.then(resume).should.notify(done)
      list.addFile path
      
    it 'should add the file to correct position (bucket)', (done) ->
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->

        expect(pathsFrom files.served).to.deep.equal ['/some/a.js', '/some/b.js', '/a.txt']
        waitForAddingFile done, '/a.js', (files) ->
          expect(pathsFrom files.served).to.deep.equal ['/some/a.js', '/some/b.js', '/a.js', '/a.txt']

    it 'should fire "file_list_modified" and pass a promise', (done) ->
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock
      
      list.refresh().then (files) ->
        waitForAddingFile done, '/a.js', (files) ->
          expect(onFileListModifiedSpy).to.have.been.called
          expect(files).to.exist


    it 'should not add excluded file (and not fire event)', (done) ->
      list = new m.List patterns('/some/*.js', '/a.*'), ['/*.js'], emitter, preprocessMock
      
      list.refresh().then (files) ->
        list.addFile '/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    it 'should not add file (neither fire event) if file already in the list', (done) ->
      # chokidar on fucking windows might fire the event multiple times
      # and we want to ignore initial adding as well
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        list.addFile '/some/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()

    it 'should set proper mtime of new file', (done) ->
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        waitForAddingFile done, '/a.js', (files) ->
          expect(findFile('/a.js', files.served).mtime).to.deep.equal new Date '2012-01-01'


    it 'should preprocess added file', ->
      # MATCH: /a.txt
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        preprocessMock.reset()
        waitForAddingFile done, '/a.js', ->
          expect(preprocessMock).to.have.been.called
          expect(preprocessMock.argsForCall[0][0].originalPath).to.equal '/a.js'


  #============================================================================
  # List.changeFile()
  #============================================================================
  describe 'changeFile', ->

    waitForChangingFile = (done, path, resume) ->
      emitter.once 'file_list_modified', (promise) ->
        expect(promise).to.be.fulfilled.then(resume).should.notify(done)
      list.changeFile path

    it 'should update mtime and fire "file_list_modified"', (done) ->
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile done, '/some/b.js', (files) ->
          expect(onFileListModifiedSpy).to.have.been.called
          expect(findFile('/some/b.js', files.served).mtime).to.deep.equal new Date '2020-01-01'


    it 'should not fire "file_list_modified" if no matching file', (done) ->
      # MATCH: /some/a.js
      list = new m.List patterns('/some/*.js', '/a.*'), ['/some/b.js'], emitter, preprocessMock

      list.refresh().then (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        list.changeFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    it 'should not fire "file_list_modified" if mtime has not changed', (done) ->
      # chokidar on fucking windows sometimes fires event multiple times
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        # not touching the file, stat will return still the same
        list.changeFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    # WIN
    # it 'should remove file if ENOENT stat', (done) ->
    #   # chokidar fires "change" instead of remove, on windows
    #   # MATCH: /a.txt
    #   list = new m.List patterns('/a.*'), [], emitter, preprocessMock

    #   list.refresh().then (files) ->
    #     list.getServedFiles()[0].originalPath = '/non-existing-file'
    #     waitForChangingFile done, '/non-existing-file', (files) ->
    #       expect(files.served).to.deep.equal []
    #       expect(onFileListModifiedSpy).to.have.been.called


    it 'should preprocess changed file', (done) ->
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        preprocessMock.reset()
        mockFs._touchFile '/some/a.js', '2020-01-01'
        list.changeFile '/some/a.js', ->
          expect(preprocessMock).to.have.been.called
          expect(preprocessMock.lastCall.args[0]).to.have.property 'path', '/some/a.js'
          done()


  #============================================================================
  # List.removeFile()
  #============================================================================
  describe 'removeFile', ->

    waitForRemovingFile = (done, path, resume) ->
      emitter.once 'file_list_modified', (promise) ->
        expect(promise).to.be.fulfilled.then(resume).should.notify(done)
      list.removeFile path

    it 'should remove file from list and fire "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        waitForRemovingFile '/some/a.js', (files) ->
          expect(pathsFrom files.served).to.deep.equal ['/some/b.js', '/a.txt']
          expect(onFileListModifiedSpy).to.have.been.called;



    it 'should not fire "file_list_modified" if file is not in the list', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      list.refresh().then (files) ->
        waitForRemovingFile '/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called;

  #============================================================================
  # Batch Interval processing
  #============================================================================
  describe 'batch interval', ->
    it 'should batch multiple changes within an interval', (done) ->
      timeoutSpy = sinon.stub().returns true
      globals_ = setTimeout: timeoutSpy

      m = mocks.loadFile __dirname + '/../../lib/file-list.js', mocks_, globals_
      
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock, 1000
      list.refresh().then (files) ->
        timeoutSpy.reset()
        emitter.once 'file_list_modified', (promise) ->
          expect(promise).to.be.fulfilled.then (files) ->
            expect(pathsFrom files.served).to.deep.equal ['/some/0.js', '/some/b.js', '/a.txt']
            expect(onFileListModifiedSpy).to.have.been.calledOnce
            
            # another batch, should fire new "file_list_modified" event
            onFileListModifiedSpy.reset()
            timeoutSpy.reset()
            emitter.once 'file_list_modified', (promise) ->
              expect(promise).to.be.fulfilled.then((files) ->
                expect(pathsFrom files.served).to.deep.equal ['/some/b.js', '/a.txt']
                expect(onFileListModifiedSpy).to.have.been.calledOnce
              ).should.notify(done)
              

            list.removeFile '/some/0.js' # /some/b.js, /a.txt
            process.nextTick -> process.nextTick ->
              expect(timeoutSpy).to.have.been.called
              timeoutSpy.lastCall.args[0]()
            

        mockFs._touchFile '/some/b.js', '2020-01-01'
        list.changeFile '/some/b.js'
        list.removeFile '/some/a.js' # /some/b.js, /a.txt
        list.removeFile '/a.txt' # /some/b.js
        list.addFile '/a.txt' # /some/b.js, /a.txt
        list.addFile '/some/0.js' # /some/0.js, /some/b.js, /a.txt

        expect(onFileListModifiedSpy).to.have.been.called
        process.nextTick -> process.nextTick ->
          expect(timeoutSpy).to.have.been.called
          timeoutSpy.lastCall.args[0]()
  
  #============================================================================
  # Win Globbing
  #============================================================================
  describe 'createWinGlob', ->

    it 'should path separator is slash', ->
      mockGlob = (pattern, opts, done) ->
        expect(pattern).to.equal 'x:/Users/vojta/*.js'
        # for Travis test
        results = [
          path.join('x:', 'Users', 'vojta', 'file.js'),
          path.join('x:', 'Users', 'vojta', 'more.js')
        ]
        done null, results

      winGlob = m.createWinGlob mockGlob

      winGlob 'x:/Users/vojta/*.js', {}, (err, results) ->
        expect(results).to.deep.equal ['x:/Users/vojta/file.js', 'x:/Users/vojta/more.js']
