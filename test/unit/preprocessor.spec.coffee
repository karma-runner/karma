#==============================================================================
# lib/preprocessor.js module
#==============================================================================
describe 'preprocessor', ->
  mocks = require 'mocks'
  di = require 'di'

  m = pp = mockFs = null

  beforeEach ->
    mockFs = mocks.fs.create
      some:
        'a.js': mocks.fs.file 0, 'content'

    mocks_ =
      fs: mockFs
      minimatch: require 'minimatch'

    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_


  it 'should preprocess matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done 'new-content'

    injector = new di.Injector [{'preprocessor:fake': ['factory', -> fakePreprocessor]}]
    pp = m.createPreprocessor {'**/*.js': ['fake']}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).to.equal 'new-content'
      done()

  it 'should send configuration options for the preprocessor', (done) ->
    configurablePreprocessor = sinon.spy (content, file, done, options) ->
      file.path = file.path + '-preprocessed'
      file.contentPath = '/some/new.js'
      done "new-content, #{options.append}"

    injector = new di.Injector [{'preprocessor:fake': ['factory', -> configurablePreprocessor]}]
    ppSetup = name: 'fake', options: {append: 'test'}
    pp = m.createPreprocessor {'**/*.js': [ppSetup]}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(configurablePreprocessor).to.have.been.called
      expect(file.path).to.equal 'path-preprocessed'
      expect(mockFs.readFileSync('/some/new.js').toString()).to.equal 'new-content, test'
      done()


  it 'should ignore not matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      done ''

    injector = new di.Injector [{'preprocessor:fake': ['factory', -> fakePreprocessor]}]
    pp = m.createPreprocessor {'**/*.js': ['fake']}, null, injector

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.not.have.been.called
      done()


  it 'should apply all preprocessors', (done) ->
    fakePreprocessor1 = sinon.spy (content, file, done) ->
      file.contentPath = '/some/new.js'
      file.path = file.path + '-p1'
      done content + '-c1'

    fakePreprocessor2 = sinon.spy (content, file, done) ->
      file.path = file.path + '-p2'
      done content + '-c2'

    injector = new di.Injector [{
      'preprocessor:fake1': ['factory', -> fakePreprocessor1]
      'preprocessor:fake2': ['factory', -> fakePreprocessor2]
    }]

    pp = m.createPreprocessor {'**/*.js': ['fake1', 'fake2']}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(fakePreprocessor1).to.have.been.calledOnce
      expect(fakePreprocessor2).to.have.been.calledOnce
      expect(file.path).to.equal 'path-p1-p2'
      expect(mockFs.readFileSync('/some/new.js').toString()).to.equal 'content-c1-c2'
      done()
