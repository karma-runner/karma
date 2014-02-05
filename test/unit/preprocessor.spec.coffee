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
        'a.txt': mocks.fs.file 0, 'some-text'
        'photo.png': mocks.fs.file 0, 'binary'

    mocks_ =
      'graceful-fs': mockFs
      minimatch: require 'minimatch'

    m = mocks.loadFile __dirname + '/../../lib/preprocessor.js', mocks_


  it 'should preprocess matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      file.path = file.path + '-preprocessed'
      done null, 'new-content'

    injector = new di.Injector [{'preprocessor:fake': ['factory', -> fakePreprocessor]}]
    pp = m.createPreprocessor {'**/*.js': ['fake']}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal 'path-preprocessed'
      expect(file.content).to.equal 'new-content'
      done()


  it 'should ignore not matching file', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      done null, ''

    injector = new di.Injector [{'preprocessor:fake': ['factory', -> fakePreprocessor]}]
    pp = m.createPreprocessor {'**/*.js': ['fake']}, null, injector

    file = {originalPath: '/some/a.txt', path: 'path'}

    pp file, ->
      expect(fakePreprocessor).to.not.have.been.called
      done()


  it 'should apply all preprocessors', (done) ->
    fakePreprocessor1 = sinon.spy (content, file, done) ->
      file.path = file.path + '-p1'
      done null, content + '-c1'

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
      expect(file.content).to.equal 'content-c1-c2'
      done()


  it 'should compute SHA', (done) ->
    pp = m.createPreprocessor {}, null, new di.Injector([])
    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, ->
      expect(file.sha).to.exist
      expect(file.sha.length).to.equal 40
      previousSHA = file.sha

      pp file, ->
        expect(file.sha).to.equal previousSHA
        mockFs._touchFile '/some/a.js', null, 'new-content'

        pp file, ->
          expect(file.sha.length).to.equal 40
          expect(file.sha).not.to.equal previousSHA
          done()


  it 'should return error if any preprocessor fails', (done) ->
    failingPreprocessor = sinon.spy (content, file, done) ->
      done new Error('Some error'), null

    injector = new di.Injector [{
      'preprocessor:failing': ['factory', -> failingPreprocessor]
    }]

    pp = m.createPreprocessor {'**/*.js': ['failing']}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, (err) ->
      expect(err).to.exist
      done()


  it 'should stop preprocessing after an error', (done) ->
    failingPreprocessor = sinon.spy (content, file, done) ->
      done new Error('Some error'), null

    fakePreprocessor = sinon.spy (content, file, done) ->
      done null, content


    injector = new di.Injector [{
      'preprocessor:failing': ['factory', -> failingPreprocessor]
      'preprocessor:fake': ['factory', -> fakePreprocessor]
    }]

    pp = m.createPreprocessor {'**/*.js': ['failing', 'fake']}, null, injector

    file = {originalPath: '/some/a.js', path: 'path'}

    pp file, (err) ->
      expect(fakePreprocessor).not.to.have.been.called
      done()


  it 'should not preprocess binary files', (done) ->
    fakePreprocessor = sinon.spy (content, file, done) ->
      done null, content

    injector = new di.Injector [{
      'preprocessor:fake': ['factory', -> fakePreprocessor]
    }]

    pp = m.createPreprocessor {'**/*': ['fake']}, null, injector

    file = {originalPath: '/some/photo.png', path: 'path'}

    pp file, (err) ->
      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof Buffer
      done()
