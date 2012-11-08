#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  mocks = require 'mocks'
  q     = require 'q'
  
  util  = require '../test-util'
  
  m = pp = pp2 = mockFs = doneSpy = firstPreprocessor = secondPreprocessor = null

  waitsForDoneAnd = (resume) ->
    waitsFor (-> doneSpy.callCount), 'done callback'
    runs resume

  beforeEach util.disableLogger

  beforeEach ->
    mockFs = mocks.fs.create
      some:
        'a.js': mocks.fs.file 0, 'originalContent'

    firstPreprocessor = jasmine.createSpy 'first preprocessor'
    secondPreprocessor = jasmine.createSpy 'second preprocessor'    
    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'
      './preprocessors/Coffee': firstPreprocessor
      './preprocessors/Coverage': secondPreprocessor      
      
    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_

    pp = m.createPreprocessor {'**/*.js': 'coffee'}, null
    pp2 = m.createPreprocessor {'**/*.js': ['coffee', 'coverage']}, null

  it 'should preprocess matching file', ->
    firstPreprocessor.andCallFake (content) ->
      d = q.defer()
      content.file.path = content.file.path + '-preprocessed'
      content.file.contentPath = '/some/new.js'
      content.file.content = 'new-content'
      d.resolve content
      d.promise

    file = {originalPath: '/some/a.js', path: 'path'}

    pp(file).then (content) ->
      expect(firstPreprocessor).toHaveBeenCalled()
      expect(content.file.path).toBe 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).toBe 'new-content'
  
  it 'should ignore not matching file', ->
    firstPreprocessor.andCallFake (file) ->
      d = q.defer()      
      d.resolve file
      d.promise
  
    file = {originalPath: '/some/a.txt', path: 'path'}
  
    pp(file).then (content) ->
      expect(content).not.toBeDefined()
  
  it 'should be able to chain preprocessors', ->
    firstPreprocessor.andCallFake (content) ->
      d = q.defer()
      content.file.path = content.file.path + '-first'
      content.file.contentPath = '/some/new.js'
      content.value = 'new-first'
      d.resolve content
      d.promise
  
    secondPreprocessor.andCallFake (content) ->
      d = q.defer()
      content.file.path = content.file.path + '-second'
      content.file.contentPath = '/some/new.js'
      content.value = "#{content.value}-new-second"
      d.resolve content
      d.promise
  
    file = {originalPath: '/some/a.js', path: 'path'}
  
    pp2(file).then (content) ->
      expect(firstPreprocessor).toHaveBeenCalled()
      expect(secondPreprocessor).toHaveBeenCalled()      
      expect(content.file.path).toBe 'path-first-second'
      expect(mockFs.readFileSync('/some/new.js').toString()).toBe 'new-first-new-second'
