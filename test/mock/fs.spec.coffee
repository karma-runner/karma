describe 'fs', ->
  fs = callback = null

  beforeEach ->
    callback = jasmine.createSpy 'callback'
    fs = require './fs'
    fs.init
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
          'some.js': 1
          'another.js': 1


  # ===========================================================================
  # fs.stat
  # ===========================================================================
  describe '.stat', ->

    it 'should be async', ->
      result = fs.stat '/bin', callback
      expect(result).toBeUndefined()


    it 'should stat directory', ->
      callback.andCallFake (err, stat) ->
        expect(err).toBeFalsy()
        expect(stat.isDirectory()).toBe true

      fs.stat '/bin', callback
      fs.flush()
      expect(callback).toHaveBeenCalled()


    it 'should stat file', ->
      callback.andCallFake (err, stat) ->
        expect(err).toBeFalsy()
        expect(stat.isDirectory()).toBe false

      fs.stat '/bin/grep', callback
      fs.stat '/home/vojta/some.js', callback
      fs.flush()
      expect(callback).toHaveBeenCalled()
      expect(callback.callCount).toBe 2


    it 'should return error when path does not exist', ->
      callback.andCallFake (err, stat) ->
        expect(err).toBeTruthy()
        expect(stat).toBeFalsy()

      fs.stat '/notexist', callback
      fs.stat '/home/notexist', callback
      fs.flush()
      expect(callback).toHaveBeenCalled()
      expect(callback.callCount).toBe 2


  # ===========================================================================
  # fs.readdir
  # ===========================================================================
  describe '.readdir', ->

    it 'should be async', ->
      result = fs.readdir '/bin', callback
      expect(result).toBeUndefined()


    it 'should return array of files and directories', ->
      callback.andCallFake (err, files) ->
        expect(err).toBeFalsy()
        expect(files).toContain 'sub'
        expect(files).toContain 'some.js'
        expect(files).toContain 'another.js'

      fs.readdir '/home/vojta', callback
      fs.flush()
      expect(callback).toHaveBeenCalled()


    it 'should return error if does not exist', ->
      callback.andCallFake (err, files) ->
        expect(err).toBeTruthy()
        expect(files).toBeFalsy()

      fs.readdir '/home/not', callback
      fs.flush()
      expect(callback).toHaveBeenCalled()

