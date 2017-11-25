var mocks = require('mocks')
var di = require('di')
var path = require('path')

var events = require('../../lib/events')

describe('preprocessor', () => {
  var pp
  var m
  var mockFs
  var emitterSetting
  // mimic first few bytes of a pdf file
  var binarydata = new Buffer([0x25, 0x50, 0x44, 0x66, 0x46, 0x00]) // eslint-disable-line node/no-deprecated-api

  beforeEach(() => {
    mockFs = mocks.fs.create({
      some: {
        'a.js': mocks.fs.file(0, 'content'),
        'b.js': mocks.fs.file(0, 'content'),
        'a.txt': mocks.fs.file(0, 'some-text'),
        'photo.png': mocks.fs.file(0, binarydata),
        'CAM_PHOTO.JPG': mocks.fs.file(0, binarydata),
        '.dir': {
          'a.js': mocks.fs.file(0, 'content')
        }
      }
    })

    var mocks_ = {
      'graceful-fs': mockFs,
      minimatch: require('minimatch')
    }
    emitterSetting = {'emitter': ['value', new events.EventEmitter()]}
    m = mocks.loadFile(path.join(__dirname, '/../../lib/preprocessor.js'), mocks_)
  })

  it('should preprocess matching file', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': [
        'factory', function () { return fakePreprocessor }
      ]
    }, emitterSetting])
    pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should match directories starting with a dot', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor } ]
    }, emitterSetting])
    pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

    var file = {originalPath: '/some/.dir/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should check patterns after creation when invoked', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
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

  it('should ignore not matching file', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, '')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

    var file = {originalPath: '/some/a.txt', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).to.not.have.been.called
      done()
    })
  })

  it('should apply all preprocessors', (done) => {
    var fakePreprocessor1 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p1'
      done(null, content + '-c1')
    })

    var fakePreprocessor2 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p2'
      done(content + '-c2')
    })

    var injector = new di.Injector([{
      'preprocessor:fake1': ['factory', function () { return fakePreprocessor1 }],
      'preprocessor:fake2': ['factory', function () { return fakePreprocessor2 }]
    }, emitterSetting])

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

  it('should compute SHA', (done) => {
    pp = m.createPreprocessor({}, null, new di.Injector([emitterSetting]))
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

  it('should compute SHA from content returned by a processor', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content + '-processed')
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

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

  it('should return error if any preprocessor fails', (done) => {
    var failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    var injector = new di.Injector([{
      'preprocessor:failing': ['factory', function () { return failingPreprocessor }]
    }, emitterSetting])

    pp = m.createPreprocessor({'**/*.js': ['failing']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, (err) => {
      expect(err).to.exist
      done()
    })
  })

  it('should stop preprocessing after an error', (done) => {
    var failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:failing': ['factory', function () { return failingPreprocessor }],
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPreprocessor({'**/*.js': ['failing', 'fake']}, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, () => {
      expect(fakePreprocessor).not.to.have.been.called
      done()
    })
  })

  describe('when fs.readFile fails', () => {
    var file = {originalPath: '/some/a.js', path: 'path'}
    var getReadFileCallback = (nthCall) => {
      return mockFs.readFile.args[nthCall][1]
    }

    beforeEach(() => {
      sinon.stub(mockFs, 'readFile')
    })

    it('should retry up to 3 times', (done) => {
      var fakePreprocessor = sinon.spy((content, file, done) => {
        done(null, content)
      })

      var injector = new di.Injector([{
        'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
      }, emitterSetting])

      var pp = m.createPreprocessor({'**/*.js': ['fake']}, null, injector)

      pp(file, () => {
        expect(fakePreprocessor).to.have.been.called
        done()
      })
      getReadFileCallback(0)('error')
      getReadFileCallback(1)('error')
      var thirdCallback = getReadFileCallback(2)
      mockFs.readFile.restore()
      thirdCallback('error')
    })

    it('should tbrow after 3 retries', (done) => {
      var injector = new di.Injector([{}, emitterSetting])

      var pp = m.createPreprocessor({'**/*.js': []}, null, injector)

      pp(file, () => { })

      getReadFileCallback(0)('error')
      getReadFileCallback(1)('error')
      getReadFileCallback(2)('error')

      expect(() => getReadFileCallback(0)('error')).to.throw('error')
      done()
    })
  })

  it('should not preprocess binary files', (done) => {
    var fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPreprocessor({'**/*': ['fake']}, null, injector)

    var file = {originalPath: '/some/photo.png', path: 'path'}

    pp(file, (err) => {
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
      'preprocessor:fake': ['factory', function () { fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPreprocessor({'**/*': ['fake']}, null, injector)

    var file = {originalPath: '/some/CAM_PHOTO.JPG', path: 'path'}

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })

  it('should merge lists of preprocessors', (done) => {
    var callOrder = []
    var fakePreprocessorA = sinon.spy((content, file, done) => {
      callOrder.push('a')
      done(null, content)
    })
    var fakePreprocessorB = sinon.spy((content, file, done) => {
      callOrder.push('b')
      done(null, content)
    })
    var fakePreprocessorC = sinon.spy((content, file, done) => {
      callOrder.push('c')
      done(null, content)
    })
    var fakePreprocessorD = sinon.spy((content, file, done) => {
      callOrder.push('d')
      done(null, content)
    })

    var injector = new di.Injector([{
      'preprocessor:fakeA': ['factory', function () { return fakePreprocessorA }],
      'preprocessor:fakeB': ['factory', function () { return fakePreprocessorB }],
      'preprocessor:fakeC': ['factory', function () { return fakePreprocessorC }],
      'preprocessor:fakeD': ['factory', function () { return fakePreprocessorD }]
    }, emitterSetting])

    pp = m.createPreprocessor({
      '/*/a.js': ['fakeA', 'fakeB'],
      '/some/*': ['fakeB', 'fakeC'],
      '/some/a.js': ['fakeD']
    }, null, injector)

    var file = {originalPath: '/some/a.js', path: 'path'}

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessorA).to.have.been.called
      expect(fakePreprocessorB).to.have.been.called
      expect(fakePreprocessorC).to.have.been.called
      expect(fakePreprocessorD).to.have.been.called

      expect(callOrder.indexOf('d')).not.to.equal(-1)
      expect(callOrder.filter((letter) => {
        return letter !== 'd'
      })).to.eql(['a', 'b', 'c'])
      done()
    })
  })
})
