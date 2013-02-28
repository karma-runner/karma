#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  mocks = require 'mocks'
  di = require 'di'

  m = pp = mockFs = fakePreprocessor = null

  beforeEach ->
    mockFs = mocks.fs.create
      some:
        'a.js': mocks.fs.file 0, 'originalContent'
    injector = new di.Injector [{'preprocessor:fake': ['factory', -> fakePreprocessor]}]

    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'

    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_
    pp = m.createPreprocessor {'**/*.js': 'fake'}, null, injector


  it 'should preprocess matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done 'new-content'

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).to.equal 'new-content'
      done()


  it 'should ignore not matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      done ''

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.not.have.been.called
      done()
