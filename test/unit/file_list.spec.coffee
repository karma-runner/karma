#==============================================================================
# lib/file_list.js module
#==============================================================================
describe 'file_list', ->
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

  # TODO(vojta): create new fs, as we mutate the file stats now
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

  # refresh the list and
  # - ignore the file_list_modified event fired during refresh()
  # - rethrow exceptions
  refreshListAndThen = (resume) ->
    list.refresh().then((files) ->
      onFileListModifiedSpy.reset()
      resume files
    ).done()

  # create an array of pattern objects from given strings
  patterns = (strings...) ->
    new config.Pattern(str) for str in strings


  beforeEach ->

    mocks_ =
      glob: mockGlob
      fs: mockFs
      minimatch: require('minimatch')

    m = mocks.loadFile __dirname + '/../../lib/file_list.js', mocks_

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
      list = new m.List patterns('/some/*.js', '*.txt'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(list.buckets.length).to.equal 2
        # first bucket == first pattern (even though callbacks were reversed)
        expect(pathsFrom list.buckets[0]).to.contain '/some/a.js', '/some/b.js'
        expect(pathsFrom list.buckets[1]).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()


    it 'should ignore directories', (done) ->
      list = new m.List patterns('*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(pathsFrom list.buckets[0]).to.contain '/folder/x.js'
        expect(pathsFrom list.buckets[0]).not.to.contain '/folder/'
        done()


    it 'should set mtime for every file', (done) ->
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(findFile('/some/a.js', list.buckets[0]).mtime).to.deep.equal new Date '2012-04-04'
        expect(findFile('/some/b.js', list.buckets[0]).mtime).to.deep.equal new Date '2012-05-05'
        done()


    it 'should ignore files matching excludes', (done) ->
      list = new m.List patterns('*.txt'), ['/a.*', '**/b.txt'], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(pathsFrom list.buckets[0]).to.contain '/c.txt'
        expect(pathsFrom list.buckets[0]).not.to.contain '/a.txt'
        expect(pathsFrom list.buckets[0]).not.to.contain '/b.txt'
        done()


    it 'should not glob urls and set isUrl flag', (done) ->
      list = new m.List patterns('http://some.com'), [], emitter

      refreshListAndThen (files) ->
        expect(findFile('http://some.com', list.buckets[0]).isUrl).to.equal  true
        done()


    it 'should preprocess all files', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(preprocessMock).to.have.been.called
        expect(preprocessMock.callCount).to.equal 2
        done()


    it 'should return a promise with list of files', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(files.included).to.exist
        expect(files.served).to.exist
        done()

    it 'should handle fs.stat errors', (done) ->
      sinon.stub(mockFs, 'stat').yields([new Error(), null])
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        mockFs.stat.restore()
        done()


    it 'should reject the promise if a preprocessor fails', (done) ->
      preprocessMock = (file, next) ->
        next new Error('Prerocess failure.'), null

      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock
      spyResolve = sinon.spy()
      spyReject = sinon.spy()

      list.refresh().then(spyResolve, spyReject).done ->
        expect(spyResolve).not.to.have.been.called
        expect(spyReject).to.have.been.called
        done()


  #============================================================================
  # List.reload()
  #============================================================================
  describe 'reload', ->

    it 'should reload the patterns and return promise', (done) ->
      # MATCH /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

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
      list = new m.List patterns('*.txt'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(files.served.length).to.equal 3
        expect(pathsFrom files.served).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()


    it 'should return unique set', (done) ->
      list = new m.List patterns('/a.*', '*.txt'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(files.served.length).to.equal 3
        expect(pathsFrom files.served).to.contain '/a.txt', '/b.txt', '/c.txt'
        done()


    it 'should sort files within buckets and keep order of patterns (buckets)', (done) ->
      # /a.*       => /a.txt                   [MATCH in *.txt as well]
      # /some/*.js => /some/a.js, /some/b.js   [/some/b.js EXCLUDED]
      # *.txt      => /c.txt, a.txt, b.txt     [UNSORTED]
      list = new m.List patterns('/a.*', '/some/*.js', '*.txt'), ['**/b.js'], emitter,
                        preprocessMock

      refreshListAndThen (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/a.txt', '/some/a.js', '/b.txt', '/c.txt']
        done()


    it 'should sort files within buckets (if more than 11 elements)', (done) ->
      # regression for sorting many items
      list = new m.List patterns('**'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/a.txt', '/b.txt', '/c.txt']
        done()


    it 'should return only served files', (done) ->
      # /a.*       => /a.txt                   [served TRUE]
      # /some/*.js => /some/a.js, /some/b.js   [served FALSE]
      files = [new config.Pattern('/a.*', true), new config.Pattern('/some/*.js', false)]
      list = new m.List files, [], emitter, preprocessMock

      refreshListAndThen (files) ->
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
      list = new m.List files, [], emitter, preprocessMock

      refreshListAndThen (files) ->
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

      refreshListAndThen (files) ->
        expect(pathsFrom files.served).to.deep.equal ['/some/a.js', '/some/b.js', '/a.txt']
        waitForAddingFile done, '/a.js', (files) ->
          expect(pathsFrom files.served).to.deep.equal [
            '/some/a.js', '/some/b.js', '/a.js', '/a.txt'
          ]


    it 'should fire "file_list_modified" and pass a promise', (done) ->
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        waitForAddingFile done, '/a.js', (files) ->
          expect(onFileListModifiedSpy).to.have.been.called
          expect(files).to.exist


    it 'should not add excluded file (and not fire event)', (done) ->
      list = new m.List patterns('/some/*.js', '/a.*'), ['/*.js'], emitter, preprocessMock

      refreshListAndThen (files) ->
        list.addFile '/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    it 'should not add file (neither fire event) if file already in the list', (done) ->
      # chokidar on fucking windows might fire the event multiple times
      # and we want to ignore initial adding as well
      # MATCH: /some/a.js, /some/b.js
      list = new m.List patterns('/some/*.js'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        list.addFile '/some/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    it 'should ignore very quick double "add"', (done) ->
      # On linux fs.watch (chokidar with usePolling: false) fires "add" event twice.
      # This checks that we only stat and preprocess the file once.

      sinon.spy mockFs, 'stat'
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      pending = 2
      finish = ->
        pending--
        if pending is 0
          expect(preprocessMock).to.have.been.calledOnce
          expect(mockFs.stat).to.have.been.calledOnce
          done()

      refreshListAndThen (files) ->
        preprocessMock.reset()
        mockFs.stat.reset()

        list.addFile '/a.js', finish
        # fire again, before the stat gets back
        list.addFile '/a.js', finish


    it 'should set proper mtime of new file', (done) ->
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        waitForAddingFile done, '/a.js', (files) ->
          expect(findFile('/a.js', files.served).mtime).to.deep.equal new Date '2012-01-01'


    it 'should preprocess added file', (done) ->
      # MATCH: /a.txt
      list = new m.List patterns('/a.*'), [], emitter, preprocessMock
      refreshListAndThen (files) ->
        preprocessMock.reset()
        waitForAddingFile done, '/a.js', ->
          expect(preprocessMock).to.have.been.calledOnce
          expect(preprocessMock.args[0][0].originalPath).to.equal '/a.js'


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
      refreshListAndThen (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        waitForChangingFile done, '/some/b.js', (files) ->
          expect(onFileListModifiedSpy).to.have.been.called
          expect(findFile('/some/b.js', files.served).mtime).to.deep.equal new Date '2020-01-01'


    it 'should not fire "file_list_modified" if no matching file', (done) ->
      # MATCH: /some/a.js
      list = new m.List patterns('/some/*.js', '/a.*'), ['/some/b.js'], emitter, preprocessMock

      refreshListAndThen (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        list.changeFile '/some/b.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called
          done()


    it 'should not fire "file_list_modified" if mtime has not changed', (done) ->
      # chokidar on fucking windows sometimes fires event multiple times
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
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

      refreshListAndThen (files) ->
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

      refreshListAndThen (files) ->
        waitForRemovingFile '/some/a.js', (files) ->
          expect(pathsFrom files.served).to.deep.equal ['/some/b.js', '/a.txt']
          expect(onFileListModifiedSpy).to.have.been.called


    it 'should not fire "file_list_modified" if file is not in the list', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock

      refreshListAndThen (files) ->
        waitForRemovingFile '/a.js', ->
          expect(onFileListModifiedSpy).not.to.have.been.called


  describe 'preprocess failure', ->
    spyResolve = spyReject = null

    preprocessMock2 = (file, next) ->
      matchFile = (pattern) ->
        pattern.test and pattern.test(file.path) or pattern is file.path

      if preprocessMock2._fail.some matchFile
        next new Error('Failed to preprocess.'), null
      else
        next()

    preprocessMock2.fail = (pattern) -> preprocessMock2._fail.push(pattern)
    preprocessMock2.fix = (pattern) ->
      preprocessMock2._fail = preprocessMock2._fail.filter((p) -> pattern is not p)


    beforeEach ->
      spyResolve = sinon.spy()
      spyReject = sinon.spy()
      preprocessMock2._fail = []

      mockFs._touchFile '/some/a.js', '2012-04-04'
      mockFs._touchFile '/some/b.js', '2012-05-05'


    it 'should reject when an incorrect file added', (done) ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock2

      # once files are resolved, execute next item in the queue
      emitter.on 'file_list_modified', (files) -> files.then(spyResolve, spyReject).done next

      # refresh the list and kick off the queue
      list.refresh()

      scheduleNext ->
        spyResolve.reset()
        spyReject.reset()
        preprocessMock2.fail '/some/0.js'
        list.addFile '/some/0.js'

      scheduleNext ->
        expect(spyResolve).not.to.have.been.called
        expect(spyReject).to.have.been.called
        done()


    it 'should resolve once all the files are fixed', (done) ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock2

      # once files are resolved, execute next item in the queue
      emitter.on 'file_list_modified', (files) -> files.then(spyResolve, spyReject).done next

      # refresh the list and kick off the queue
      list.refresh()

      scheduleNext ->
        preprocessMock2.fail '/some/a.js'
        mockFs._touchFile '/some/a.js', '2020-01-01'
        list.changeFile '/some/a.js'

      scheduleNext ->
        spyResolve.reset()
        spyReject.reset()
        preprocessMock2.fix '/some/a.js'
        mockFs._touchFile '/some/a.js', '2020-01-02'
        list.changeFile '/some/a.js'

      scheduleNext ->
        expect(spyResolve).to.have.been.called
        expect(spyReject).not.to.have.been.called
        done()


    it 'should reject if only some files are fixed', (done) ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock2

      # once files are resolved, execute next item in the queue
      emitter.on 'file_list_modified', (files) -> files.then(spyResolve, spyReject).done next

      # refresh the list and kick off the queue
      list.refresh()

      scheduleNext ->
        preprocessMock2.fail '/some/a.js'
        preprocessMock2.fail '/some/b.js'
        mockFs._touchFile '/some/a.js', '2020-01-01'
        list.changeFile '/some/a.js'
        mockFs._touchFile '/some/b.js', '2020-01-01'
        list.changeFile '/some/b.js'

      scheduleNext ->
        spyResolve.reset()
        spyReject.reset()
        preprocessMock2.fix '/some/a.js'
        mockFs._touchFile '/some/a.js', '2020-01-02'
        list.changeFile '/some/a.js'

      scheduleNext ->
        # /some/b.js still contains error
        expect(spyResolve).not.to.have.been.called
        expect(spyReject).to.have.been.called
        done()


    it 'should resolve if incorrect file is removed', (done) ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock2

      # once files are resolved, execute next item in the queue
      emitter.on 'file_list_modified', (files) -> files.then(spyResolve, spyReject).done next

      # refresh the list and kick off the queue
      list.refresh()

      scheduleNext ->
        preprocessMock2.fail '/some/a.js'
        mockFs._touchFile '/some/a.js', '2020-01-01'
        list.changeFile '/some/a.js'

      scheduleNext ->
        spyResolve.reset()
        spyReject.reset()
        list.removeFile '/some/a.js'

      scheduleNext ->
        expect(spyResolve).to.have.been.called
        expect(spyReject).not.to.have.been.called
        done()


  #============================================================================
  # Batch Interval processing
  #============================================================================
  describe 'batch interval', ->

    it 'should batch multiple changes within an interval', (done) ->
      timeoutSpy = sinon.stub().returns true
      globals_ = setTimeout: timeoutSpy

      m = mocks.loadFile __dirname + '/../../lib/file_list.js', mocks_, globals_

      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new m.List patterns('/some/*.js', '/a.*'), [], emitter, preprocessMock, 1000
      refreshListAndThen (files) ->
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
