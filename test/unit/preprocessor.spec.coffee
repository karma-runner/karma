#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  mocks = require 'mocks'

  m = pp = mockFs = doneSpy = fakePreprocessor = null

  beforeEach ->
    mockFs = mocks.fs.create
      some:
        'a.js': mocks.fs.file 0, 'originalContent'


  it 'should preprocess matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, basePath, done) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done 'new-content'

    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'
      './preprocessors/Coffee': fakePreprocessor
      
    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_
    pp = m.createPreprocessor {'**/*.js': 'coffee'}, null

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).to.equal 'new-content'
      done()

  it 'should ignore not matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, basePath, done) ->
      done ''

    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'
      './preprocessors/Coffee': fakePreprocessor
      
    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_
    pp = m.createPreprocessor {'**/*.js': 'coffee'}, null

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.not.have.been.called
      done()
