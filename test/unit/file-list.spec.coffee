Promise = require 'bluebird'
EventEmitter = require('events').EventEmitter
mocks = require 'mocks'
proxyquire = require 'proxyquire'
helper = require '../../lib/helper'
_ = helper._

from = require 'core-js/library/fn/array/from'
config = require '../../lib/config'

# create an array of pattern objects from given strings
patterns = (strings...) ->
  new config.Pattern(str) for str in strings

pathsFrom = (files) ->
  _.pluck(from(files), 'path')

findFile = (path, files) ->
  from(files).find (file) -> file.path is path

PATTERN_LIST =
  '/some/*.js': ['/some/a.js', '/some/b.js']
  '*.txt':      ['/c.txt', '/a.txt', '/b.txt']
  '/a.*':       ['/a.txt']

MG =
  statCache:
    '/some/a.js': {mtime: new Date()}
    '/some/b.js': {mtime: new Date()}
    '/a.txt': {mtime: new Date()}
    '/b.txt': {mtime: new Date()}
    '/c.txt': {mtime: new Date()}

mockFs = mocks.fs.create
  some:
    '0.js': mocks.fs.file '2012-04-04'
    'a.js': mocks.fs.file '2012-04-04'
    'b.js': mocks.fs.file '2012-05-05'
    'd.js': mocks.fs.file '2012-05-05'
  folder:
    'x.js': mocks.fs.file 0
  'a.txt': mocks.fs.file 0
  'b.txt': mocks.fs.file 0
  'c.txt': mocks.fs.file 0
  'a.js':  mocks.fs.file '2012-01-01'

describe 'FileList', ->
  List = list = emitter = preprocess = patternList = mg = modified = glob = null

  beforeEach ->

  describe 'files', ->
    beforeEach ->
      patternList = PATTERN_LIST
      mg = MG
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

    it 'returns a flat array of served files', ->
      list = new List(
        patterns('/some/*.js'),
        [],
        emitter,
        preprocess
      )

      list.refresh().then ->
        expect(list.files.served).to.have.length 2

    it 'returns a unique set', ->
      list = new List(
        patterns('/a.*', '*.txt'),
        [],
        emitter,
        preprocess
      )

      list.refresh().then ->
        expect(list.files.served).to.have.length 3
        expect(pathsFrom list.files.served).to.contain '/a.txt', '/b.txt', '/c.txt'

    it 'returns only served files', ->
      files = [
        new config.Pattern('/a.*', true)        # served: true
        new config.Pattern('/some/*.js', false) # served: false
      ]

      list = new List(files, [], emitter, preprocess)

      list.refresh().then ->
        expect(pathsFrom list.files.served).to.eql ['/a.txt']

    it 'marks no cache files', ->
      files = [
        new config.Pattern('/a.*')        # nocach: false
        new config.Pattern('/some/*.js', true, true, true, true) # nocache: true
      ]

      list = new List(files, [], emitter, preprocess)

      list.refresh().then ->
        expect(pathsFrom list.files.served).to.deep.equal [
          '/a.txt',
          '/some/a.js',
          '/some/b.js'
        ]
        expect(preprocess).to.have.been.calledOnce
        expect(list.files.served[0].doNotCache).to.be.false
        expect(list.files.served[1].doNotCache).to.be.true
        expect(list.files.served[2].doNotCache).to.be.true

    it 'returns a flat array of included files', ->
      files = [
        new config.Pattern('/a.*', true, false) # included: false
        new config.Pattern('/some/*.js') # included: true
      ]

      list = new List(files, [], emitter, preprocess)

      list.refresh().then ->
        expect(pathsFrom list.files.included).not.to.contain '/a.txt'
        expect(pathsFrom list.files.included).to.deep.equal [
          '/some/a.js'
          '/some/b.js'
        ]



  describe '_isExcluded', ->
    beforeEach ->
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

    it 'returns undefined when no match is found', ->
      list = new List([], ['hello.js', 'world.js'], emitter, preprocess)
      expect(list._isExcluded('hello.txt')).to.be.undefined
      expect(list._isExcluded('/hello/world/i.js')).to.be.undefined

    it 'returns the first match if it finds one', ->
      list = new List([], ['*.js', '**/*.js'], emitter, preprocess)
      expect(list._isExcluded('world.js')).to.be.eql '*.js'
      expect(list._isExcluded('/hello/world/i.js')).to.be.eql '**/*.js'


  describe '_isIncluded', ->
    beforeEach ->
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

    it 'returns undefined when no match is found', ->
      list = new List(patterns('*.js'), [], emitter, preprocess)
      expect(list._isIncluded('hello.txt')).to.be.undefined
      expect(list._isIncluded('/hello/world/i.js')).to.be.undefined

    it 'returns the first match if it finds one', ->
      list = new List(patterns('*.js', '**/*.js'), [], emitter, preprocess)
      expect(list._isIncluded('world.js').pattern).to.be.eql '*.js'
      expect(list._isIncluded('/hello/world/i.js').pattern).to.be.eql '**/*.js'

  describe '_exists', ->
    beforeEach ->
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

      list = new List(
        patterns('/some/*.js', '*.txt'),
        [],
        emitter,
        preprocess
      )

      list.refresh()

    it 'returns false when no match is found', ->
      expect(list._exists('/some/s.js')).to.be.false
      expect(list._exists('/hello/world.ex')).to.be.false

    it 'returns true when a match is found', ->
      expect(list._exists('/some/a.js')).to.be.true
      expect(list._exists('/some/b.js')).to.be.true

  describe 'refresh', ->
    beforeEach ->
      patternList = _.cloneDeep(PATTERN_LIST)
      mg = _.cloneDeep(MG)
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

      list = new List(
        patterns('/some/*.js', '*.txt'),
        [],
        emitter,
        preprocess
      )

    it 'resolves patterns', ->
      list.refresh().then (files) ->
        expect(list.buckets.size).to.equal 2

        first = pathsFrom list.buckets.get('/some/*.js')
        second = pathsFrom list.buckets.get('*.txt')

        expect(first).to.contain '/some/a.js', '/some/b.js'
        expect(second).to.contain '/a.txt', '/b.txt', '/c.txt'

    it 'cancels refreshs', ->
      checkResult = (files) ->
        expect(_.pluck(files.served, 'path')).to.contain '/some/a.js', '/some/b.js', '/some/c.js'

      p1 = list.refresh().then checkResult
      patternList['/some/*.js'].push '/some/c.js'
      mg.statCache['/some/c.js'] = {mtime: new Date()}
      p2 = list.refresh().then checkResult

      Promise.all([p1, p2])

    it 'sets the mtime for all files', ->
      list.refresh().then (files) ->
        bucket = list.buckets.get('/some/*.js')

        file1 = findFile '/some/a.js', bucket
        file2 = findFile '/some/b.js', bucket

        expect(file1.mtime).to.be.eql mg.statCache['/some/a.js'].mtime
        expect(file2.mtime).to.be.eql mg.statCache['/some/b.js'].mtime

    it 'sets the mtime for relative patterns', ->
      list = new List(
        patterns('/some/world/../*.js', '*.txt'),
        [],
        emitter,
        preprocess
      )

      list.refresh().then (files) ->
        bucket = list.buckets.get('/some/world/../*.js')

        file1 = findFile '/some/a.js', bucket
        file2 = findFile '/some/b.js', bucket

        expect(file1.mtime).to.be.eql mg.statCache['/some/a.js'].mtime
        expect(file2.mtime).to.be.eql mg.statCache['/some/b.js'].mtime


    it 'ingores excluded files', ->
      list = new List(
        patterns('*.txt'),
        ['/a.*', '**/b.txt'],
        emitter,
        preprocess
      )

      list.refresh().then (files) ->
        bucket = pathsFrom list.buckets.get('*.txt')

        expect(bucket).to.contain '/c.txt'
        expect(bucket).not.to.contain '/a.txt'
        expect(bucket).not.to.contain '/b.txt'

    it 'does not glob urls and sets the isUrl flag', ->
      list = new List(
        patterns('http://some.com'),
        [],
        emitter,
        preprocess
      )

      list.refresh()
      .then (files) ->
        bucket = list.buckets.get('http://some.com')
        file = findFile('http://some.com', bucket)

        expect(file).to.have.property 'isUrl', true

    it 'preprocesses all files', ->
      list.refresh().then (files) ->
        expect(preprocess.callCount).to.be.eql 5

    it 'fails when a preprocessor fails', ->
      preprocess = sinon.spy (file, next) ->
        next new Error('failing'), null

      list = new List(
        patterns('/some/*.js'),
        [],
        emitter,
        preprocess
      )

      list.refresh().catch (err) ->
        expect(err.message).to.be.eql 'failing'


  describe 'reload', ->
    beforeEach ->
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()
      list = new List(
        patterns('/some/*.js', '*.txt'),
        [],
        emitter,
        preprocess
      )

    it 'refreshes, even when a refresh is already happening', ->
      sinon.spy(list, '_refresh')

      Promise.all([
        list.refresh()
        list.reload(patterns('*.txt'), [])
      ])
      .then ->
        expect(list._refresh).to.have.been.calledTwice


  describe 'addFile', ->
    beforeEach ->
      patternList = PATTERN_LIST
      mg = MG

      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

      list = new List(
        patterns('/some/*.js', '*.txt'),
        ['/secret/*.txt'],
        emitter,
        preprocess
      )

    it 'does not add excluded files', ->
      list.refresh().then (before) ->
        list.addFile('/secret/hello.txt').then (files) ->
          expect(files.served).to.be.eql before.served

    it 'does not add already existing files', ->
      list.refresh().then (before) ->
        list.addFile('/some/a.js').then (files) ->
          expect(files.served).to.be.eql before.served

    it 'does not add unmatching files', ->
      list.refresh().then (before) ->
        list.addFile('/some/a.ex').then (files) ->
          expect(files.served).to.be.eql before.served

    it 'adds the file to the correct bucket', ->
      list.refresh().then (before) ->
        list.addFile('/some/d.js').then (files) ->
          expect(pathsFrom files.served).to.contain '/some/d.js'
          bucket = list.buckets.get('/some/*.js')
          expect(pathsFrom bucket).to.contain '/some/d.js'

    it 'fires "file_list_modified"', ->
      modified = sinon.stub()
      emitter.on 'file_list_modified', modified

      list.refresh().then ->
        expect(modified).to.have.been.calledOnce
        modified.reset()

        list.addFile('/some/d.js').then ->
          expect(modified).to.have.been.calledOnce


    it 'ignores quick double "add"', ->
      # On linux fs.watch (chokidar with usePolling: false) fires "add" event twice.
      # This checks that we only stat and preprocess the file once.

      modified = sinon.stub()
      emitter.on 'file_list_modified', modified

      list.refresh().then ->
        expect(modified).to.have.been.calledOnce
        modified.reset()
        preprocess.reset()
        sinon.spy mockFs, 'stat'

        Promise.all([
          list.addFile('/some/d.js')
          list.addFile('/some/d.js')
        ]).then ->
          expect(modified).to.have.been.calledOnce
          expect(preprocess).to.have.been.calledOnce
          expect(mockFs.stat).to.have.been.calledOnce

    it 'sets the proper mtime of the new file', ->
      list = new List(patterns('/a.*'), [], emitter, preprocess)

      list.refresh().then ->
        list.addFile('/a.js').then (files) ->
          expect(findFile('/a.js', files.served).mtime).to.eql new Date '2012-01-01'

    it 'preprocesses the added file', ->
      # MATCH: /a.txt
      list = new List(patterns('/a.*'), [], emitter, preprocess)
      list.refresh().then (files) ->
        preprocess.reset()
        list.addFile('/a.js').then ->
          expect(preprocess).to.have.been.calledOnce
          expect(preprocess.args[0][0].originalPath).to.eql '/a.js'


  describe 'changeFile', ->
    beforeEach ->
      patternList = PATTERN_LIST
      mg = MG

      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()


      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

      mockFs._touchFile '/some/a.js', '2012-04-04'
      mockFs._touchFile '/some/b.js', '2012-05-05'

      modified = sinon.stub()
      emitter.on 'file_list_modified', modified

    it 'updates mtime and fires "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess)
      list.refresh().then (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        modified.reset()

        list.changeFile('/some/b.js').then (files) ->
          expect(modified).to.have.been.called
          expect(findFile('/some/b.js', files.served).mtime).to.be.eql new Date '2020-01-01'

    it 'does not fire "file_list_modified" if no matching file is found', ->
      # MATCH: /some/a.js
      list = new List(patterns('/some/*.js', '/a.*'), ['/some/b.js'], emitter, preprocess)

      list.refresh().then (files) ->
        mockFs._touchFile '/some/b.js', '2020-01-01'
        modified.reset()

        list.changeFile('/some/b.js').then ->
          expect(modified).to.not.have.been.called

    it 'does not fire "file_list_modified" if mtime has not changed', ->
      # chokidar on fucking windows sometimes fires event multiple times
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess)

      list.refresh().then (files) ->
        # not touching the file, stat will return still the same
        modified.reset()
        list.changeFile('/some/b.js').then ->
          expect(modified).not.to.have.been.called

    it 'preprocesses the changed file', ->
      # MATCH: /some/a.js, /some/b.js
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess)

      list.refresh().then (files) ->
        preprocess.reset()
        mockFs._touchFile '/some/a.js', '2020-01-01'
        list.changeFile('/some/a.js').then ->
          expect(preprocess).to.have.been.called
          expect(preprocess.lastCall.args[0]).to.have.property 'path', '/some/a.js'


  describe 'removeFile', ->
    beforeEach ->
      patternList = PATTERN_LIST
      mg = MG

      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

      modified = sinon.stub()
      emitter.on 'file_list_modified', modified

    it 'removes the file from the list and fires "file_list_modified"', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess)

      list.refresh().then (files) ->
        modified.reset()
        list.removeFile('/some/a.js').then (files) ->
          expect(pathsFrom files.served).to.be.eql [
            '/some/b.js',
            '/a.txt'
          ]
          expect(modified).to.have.been.calledOnce

    it 'does not fire "file_list_modified" if the file is not in the list', ->
      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess)

      list.refresh().then (files) ->
        modified.reset()
        list.removeFile('/a.js').then ->
          expect(modified).to.not.have.been.called

  describe 'batch interval', ->
    clock = null

    beforeEach ->
      patternList = PATTERN_LIST
      mg = MG

      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()

      glob = Glob: (pattern, opts) ->
        {found: patternList[pattern], statCache: mg.statCache}

      modified = sinon.stub()
      emitter.on 'file_list_modified', modified

      clock = sinon.useFakeTimers()
      # This hack is needed to ensure lodash is using the fake timers
      # from sinon
      helper._ = _.runInContext()
      List = proxyquire('../../lib/file-list', {
        helper: helper
        glob: glob
        fs: mockFs
      })

    afterEach ->
      clock.restore()

    it 'batches multiple changes within an interval', (done) ->

      # MATCH: /some/a.js, /some/b.js, /a.txt
      list = new List(patterns('/some/*.js', '/a.*'), [], emitter, preprocess, 1000)

      list.refresh().then (files) ->
        modified.reset()
        mockFs._touchFile '/some/b.js', '2020-01-01'
        list.changeFile '/some/b.js'
        list.removeFile '/some/a.js' # /some/b.js, /a.txt
        list.removeFile '/a.txt' # /some/b.js
        list.addFile '/a.txt' # /some/b.js, /a.txt
        list.addFile '/some/0.js' # /some/0.js, /some/b.js, /a.txt

        clock.tick(999)
        expect(modified).to.not.have.been.called
        emitter.once 'file_list_modified', (files) ->
          expect(pathsFrom files.served).to.be.eql [
            '/some/0.js',
            '/some/b.js',
            '/a.txt'
          ]
          done()

        clock.tick(1001)

    it 'waits while file preprocessing, if the file was deleted and immediately added', (done) ->
      list = new List(patterns('/a.*'), [], emitter, preprocess, 1000)

      list.refresh().then (files) ->
        preprocess.reset()

        # Remove and then immediately add file to the bucket
        list.removeFile '/a.txt'
        list.addFile '/a.txt'

        clock.tick(1000)

        emitter.once 'file_list_modified', (files) ->
          expect(preprocess).to.have.been.calledOnce
          done()

        clock.tick(1001)
