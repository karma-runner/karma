#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  util = require '../test-util'
  mocks = require 'mocks'
  path = require 'path'

  m = pp = mockFs = doneSpy = fakePreprocessor = xyzPreprocessor = null

  waitsForDoneAnd = (resume) ->
    waitsFor (-> doneSpy.callCount), 'done callback'
    runs resume

  beforeEach util.disableLogger

  addPath = (dirs, absPath) ->
    components = (comp for comp in (absPath.split(path.sep)) when comp != '')

    buildPath = (components) ->
      if components.length > 0
        dir = {}
        dir[components[0]] = buildPath(components.slice(1))
        dir
      else
        {}

    dirs[components[0]] = buildPath(components.slice(1))

  addTempDirs = (dirs) ->
    addIfPresent = (tmpDir) ->
      addPath(dirs, process.env[tmpDir]) if process.env[tmpDir]

    addIfPresent 'TMPDIR'
    addIfPresent 'TMP'
    addIfPresent 'TEMP'

  beforeEach ->
    dirs =
      some:
        'a.coffee': mocks.fs.file 0, 'coffee!'
        'a.xyz': mocks.fs.file 0, 'x|y|z'

    addTempDirs(dirs)

    mockFs = mocks.fs.create(dirs)

    fakePreprocessor = jasmine.createSpy 'fake preprocessor'
    xyzPreprocessor = jasmine.createSpy 'fake preprocessor'
    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'
      './preprocessors/Coffee': fakePreprocessor
      
    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_
    doneSpy = jasmine.createSpy 'done'

    pp = m.createPreprocessor {
        '**/*.coffee': 'coffee'
        '**/*.xyz': xyzPreprocessor
    }, null

  it 'should preprocess matching file', ->
    fakePreprocessor.andCallFake (content, file, basePath, done) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done 'new-content'

    file = {originalPath: '/some/a.coffee', path: 'path'}

    pp file, doneSpy
    waitsForDoneAnd ->
      expect(fakePreprocessor).toHaveBeenCalled()
      expect(file.path).toBe 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).toBe 'new-content'

  it 'should preprocess matching file with function', ->
    xyzPreprocessor.andCallFake (content, file, done) ->
      done {ext: 'xyzjs', content: 'return "' + content + '";'}

    file = {originalPath: '/some/a.xyz', path: 'a.xyz'}

    pp file, doneSpy
    waitsForDoneAnd ->
      expect(xyzPreprocessor).toHaveBeenCalled()
      expect(file.path).toBe 'a.xyz.xyzjs'
      expect(mockFs.readFileSync(file.contentPath).toString()).toBe 'return "x|y|z";'

  it 'should ignore not matching file', ->
    fakePreprocessor.andCallFake (content, file, basePath, done) ->
      done ''

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, doneSpy

    waitsForDoneAnd ->
      expect(fakePreprocessor).not.toHaveBeenCalled()
      expect(xyzPreprocessor).not.toHaveBeenCalled()
