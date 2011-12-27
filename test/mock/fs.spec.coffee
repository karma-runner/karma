#==============================================================================
# test/mock/fs.js module
#==============================================================================
describe 'fs', ->
  fsMock = require './fs'
  fs = callback = finished = null

  waitForFinished = (count = 1, name = 'FS') ->
    waitsFor (-> finished == count), name, 100

  beforeEach ->
    finished = 0

    fs = fsMock.create
      bin:
        grep: 1
        chmod: 1
      home:
        vojta:
          sub:
            'first.js': 1
            'second.js': 1
            'third.log': 1
          sub2:
            'first.js': 1
            'second.js': 1
            'third.log': 1
          'some.js': fsMock.file('2012-01-01', 'some')
          'another.js': fsMock.file('2012-01-02', 'content')


  # ===========================================================================
  # fs.stat()
  # ===========================================================================
  describe 'stat', ->

    it 'should be async', ->
      result = fs.stat '/bin', -> null
      expect(result).toBeUndefined()


    it 'should stat directory', ->
      fs.stat '/bin', (err, stat) ->
        expect(err).toBeFalsy()
        expect(stat.isDirectory()).toBe true
        finished++
      waitForFinished()


    it 'should stat file', ->
      callback = (err, stat) ->
        expect(err).toBeFalsy()
        expect(stat.isDirectory()).toBe false
        finished++

      fs.stat '/bin/grep', callback
      fs.stat '/home/vojta/some.js', callback
      waitForFinished 2


    it 'should return error when path does not exist', ->
      callback = (err, stat) ->
        expect(err).toBeTruthy()
        expect(stat).toBeFalsy()
        finished++

      fs.stat '/notexist', callback
      fs.stat '/home/notexist', callback
      waitForFinished 2


    it 'should have modified timestamp', ->
      callback = (err, stat) ->
        expect(err).toBeFalsy()
        expect(stat.mtime instanceof Date).toBe true
        expect(stat.mtime).toEqual new Date '2012-01-01'
        finished++

      fs.stat '/home/vojta/some.js', callback
      waitForFinished()


  # ===========================================================================
  # fs.readdir()
  # ===========================================================================
  describe 'readdir', ->

    it 'should be async', ->
      result = fs.readdir '/bin', -> null
      expect(result).toBeUndefined()


    it 'should return array of files and directories', ->
      callback = (err, files) ->
        expect(err).toBeFalsy()
        expect(files).toContain 'sub'
        expect(files).toContain 'some.js'
        expect(files).toContain 'another.js'
        finished++

      fs.readdir '/home/vojta', callback
      waitForFinished()


    it 'should return error if does not exist', ->
      callback = (err, files) ->
        expect(err).toBeTruthy()
        expect(files).toBeFalsy()
        finished++

      fs.readdir '/home/not', callback
      waitForFinished()


  # ===========================================================================
  # fs.readFile
  # ===========================================================================
  describe 'readFile', ->

    it 'should read file content as Buffer', ->
      callback = (err, data) ->
        expect(err).toBeFalsy()
        expect(data instanceof Buffer).toBe true
        expect(data.toString()).toBe 'some'
        finished++

      fs.readFile '/home/vojta/some.js', callback
      waitForFinished()


    it 'should be async', ->
      callback = jasmine.createSpy 'calback'
      fs.readFile '/home/vojta/some.js', callback
      expect(callback).not.toHaveBeenCalled()


    it 'should call error callback when non existing file or directory', ->
      callback = (err, data) ->
        expect(err).toBeTruthy()
        finished++

      fs.readFile '/home/vojta', callback
      fs.readFile '/some/non-existing', callback
      waitForFinished 2


    # regression
    it 'should not silent exception from callback', ->
      fs.readFile '/home/vojta/some.js', (err) ->
        throw 'CALLBACK EXCEPTION' if not err

      uncaughtExceptionCallback = (err) ->
        process.removeListener 'uncaughtException', uncaughtExceptionCallback
        expect(err).toEqual 'CALLBACK EXCEPTION'
        finished++

      process.on 'uncaughtException', uncaughtExceptionCallback
      waitForFinished 1, 'exception', 100


  # ===========================================================================
  # fs.readFileSync
  # ===========================================================================
  describe 'readFileSync', ->

    it 'should read file content and sync return buffer', ->
      buffer = fs.readFileSync '/home/vojta/another.js'
      expect(buffer instanceof Buffer).toBe true
      expect(buffer.toString()).toBe 'content'


    it 'should throw when file does not exist', ->
      expect(-> fs.readFileSync '/non-existing').
        toThrow 'No such file or directory "/non-existing"'


    it 'should throw when reading a directory', ->
      expect(-> fs.readFileSync '/home/vojta').
        toThrow 'Illegal operation on directory'


    # ===========================================================================
    # fs.watchFile
    # ===========================================================================
    describe 'watchFile', ->

      it 'should call when when file accessed', ->
        callback = jasmine.createSpy('watcher').andCallFake (current, previous) ->
          expect(current.isFile()).toBe true
          expect(previous.isFile()).toBe true
          expect(current.mtime).toEqual previous.mtime

        fs.watchFile '/home/vojta/some.js', callback
        expect(callback).not.toHaveBeenCalled()

        fs._touchFile '/home/vojta/some.js'
        expect(callback).toHaveBeenCalled()


      it 'should call when file modified', ->
        original = new Date '2012-01-01'
        modified = new Date '2012-01-02'

        callback = jasmine.createSpy('watcher').andCallFake (current, previous) ->
          expect(previous.mtime).toEqual original
          expect(current.mtime).toEqual modified

        fs.watchFile '/home/vojta/some.js', callback
        expect(callback).not.toHaveBeenCalled()

        fs._touchFile '/home/vojta/some.js', '2012-01-02', 'new content'
        expect(callback).toHaveBeenCalled()


