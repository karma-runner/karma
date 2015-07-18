import mocks from 'mocks'
import di from 'di'

describe('preprocessor', () => {
  var pp
  var m
  var mockFs

  beforeEach(() => {
    mockFs = mocks.fs.create({
      some: {
        'a.js': mocks.fs.file(0, 'content'),
        'b.js': mocks.fs.file(0, 'content'),
        'a.txt': mocks.fs.file(0, 'some-text'),
        'photo.png': mocks.fs.file(0, 'binary'),
        'CAM_PHOTO.JPG': mocks.fs.file(0, 'binary')
      }
    })

    var mocks_ = {
      'graceful-fs': mockFs,
      minimatch: require('minimatch')
    }

    m = mocks.loadFile(__dirname + '/../../lib/preprocessor.js', mocks_)
  })

  it('should preprocess matching file', done => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    var injector = new di.Injector([{'preprocessor:fake': ['factory', () => fakePreprocessor]}])
    pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should check patterns after creation when invoked', done => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    var injector = new di.Injector([{'preprocessor:fake': ['factory', () => fakePreprocessor]}])
    var config = {'**/*.txt': ['fake']}
    pp = m.createPreprocessor(config, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    config['**/*.js'] = ['fake']

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should ignore not matching file', done => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, '')
    })

    var injector = new di.Injector([{'preprocessor:fake': ['factory', () => fakePreprocessor]}])
    pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

    var file = {originalPath: '/some/a.txt', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).to.not.have.been.called
      done()
    })
  })

  it('should apply all preprocessors', done => {
    var fakePreprocessor1 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p1'
      done(null, content + '-c1')
    })

    var fakePreprocessor2 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p2'
      done(content + '-c2')
    })

    var injector = new di.Injector([{
      'preprocessor:fake1': ['factory', () => fakePreprocessor1],
      'preprocessor:fake2': ['factory', () => fakePreprocessor2]
    }])

    pp = m.createPreprocessor({'**/*.js': ['fake1', 'fake2']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor1).to.have.been.calledOnce
      expect(fakePreprocessor2).to.have.been.calledOnce
      expect(file.path).to.equal('path-p1-p2')
      expect(file.content).to.equal('content-c1-c2')
      done()
    })
  })

  it('should compute SHA', done => {
    pp = m.createPreprocessor({}, null, new di.Injector([]))
    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(file.sha).to.exist
      expect(file.sha.length).to.equal(40)
      var previousSHA = file.sha

      pp(file, () => {
        expect(file.sha).to.equal(previousSHA)
        mockFs._touchFile('/some/a.js', null, 'new-content')

        pp(file, () => {
          expect(file.sha.length).to.equal(40)
          expect(file.sha).not.to.equal(previousSHA)
          done()
        })
      })
    })
  })

  it('should compute SHA from content returned by a processor', done => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content + '-processed')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', () => fakePreprocessor]
    }])

    pp = m.createPreprocessor({'**/a.js': ['fake']}, null, injector)

    var fileProcess = {originalPath: '/some/a.js', path: 'path'}
    var fileSkip = {originalPath: '/some/b.js', path: 'path'}

    pp(fileProcess, () => {
      pp(fileSkip, () => {
        expect(fileProcess.sha).to.exist
        expect(fileProcess.sha.length).to.equal(40)
        expect(fileSkip.sha).to.exist
        expect(fileSkip.sha.length).to.equal(40)
        expect(fileProcess.sha).not.to.equal(fileSkip.sha)
        done()
      })
    })
  })

  it('should return error if any preprocessor fails', done => {
    var failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    var injector = new di.Injector([{
      'preprocessor:failing': ['factory', () => failingPreprocessor]
    }])

    pp = m.createPreprocessor({'**/*.js': ['failing']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, err => {
      expect(err).to.exist
      done()
    })
  })

  it('should stop preprocessing after an error', done => {
    var failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:failing': ['factory', () => failingPreprocessor],
      'preprocessor:fake': ['factory', () => fakePreprocessor]
    }])

    pp = m.createPreprocessor({'**/*.js': ['failing', 'fake']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).not.to.have.been.called
      done()
    })
  })

  it('should not preprocess binary files', done => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', () => fakePreprocessor]
    }])

    pp = m.createPreprocessor({'**/*': ['fake']}, null, injector)

    var file = {originalPath: '/some/photo.png', path: 'path'}

    pp(file, err => {
      if (err) throw err

      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })

  it('should not preprocess binary files with capital letters in extension', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', () => fakePreprocessor]
    }])

    pp = m.createPreprocessor({'**/*': ['fake']}, null, injector)

    var file = {originalPath: '/some/CAM_PHOTO.JPG', path: 'path'}

    pp(file, err => {
      if (err) throw err

      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })
})
