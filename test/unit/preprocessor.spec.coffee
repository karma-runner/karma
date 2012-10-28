#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  util = require '../test-util'
  mocks = require 'mocks'

  m = pp = mockFs = doneSpy = fakePreprocessor = null

  waitsForDoneAnd = (resume) ->
    waitsFor (-> doneSpy.callCount), 'done callback'
    runs resume

  beforeEach util.disableLogger

  beforeEach ->
    mockFs = mocks.fs.create
      some:
        'a.js': mocks.fs.file 0, 'originalContent'

    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'
      LiveScript: require 'LiveScript'
      'coffee-script': require 'coffee-script'

    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_
    doneSpy = jasmine.createSpy 'done'
    fakePreprocessor = m.processors.fake = jasmine.createSpy 'fake preprocessor'

    pp = m.createPreprocessor {'**/*.js': 'fake'}, null


  it 'should preprocess matching file', ->
    fakePreprocessor.andCallFake (content, file, basePath, done) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done 'new-content'

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, doneSpy
    waitsForDoneAnd ->
      expect(fakePreprocessor).toHaveBeenCalled()
      expect(file.path).toBe 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).toBe 'new-content'


  it 'should ignore not matching file', ->
    fakePreprocessor.andCallFake (content, file, basePath, done) ->
      done ''

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, doneSpy

    waitsForDoneAnd ->
      expect(m.processors.fake).not.toHaveBeenCalled()
