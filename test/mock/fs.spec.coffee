fsMock = require './fs'

describe 'fs', ->
  NOW = new Date()
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
          'some.js': fsMock.file(NOW.getTime(), 'some')
          'another.js': fsMock.file(NOW.getTime(), 'content')


  # ===========================================================================
  # fs.stat
  # ===========================================================================
  describe '.stat', ->

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
        expect(stat.mtime).toEqual NOW
        finished++

      fs.stat '/home/vojta/some.js', callback
      waitForFinished()


  # ===========================================================================
  # fs.readdir
  # ===========================================================================
  describe '.readdir', ->

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
    # TODO(vojta)


  # ===========================================================================
  # fs.readFileSync
  # ===========================================================================
  describe 'readFileSync', ->
    # TODO(vojta)
