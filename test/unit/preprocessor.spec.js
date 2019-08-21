'use strict'

const mocks = require('mocks')
const di = require('di')
const path = require('path')

const events = require('../../lib/events')

describe('preprocessor', () => {
  let pp
  let m
  let mockFs
  let emitterSetting
  // mimic first few bytes of a pdf file
  const binarydata = new Buffer([0x25, 0x50, 0x44, 0x66, 0x46, 0x00]) // eslint-disable-line node/no-deprecated-api

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

    const mocks_ = {
      'graceful-fs': mockFs,
      minimatch: require('minimatch')
    }
    emitterSetting = { 'emitter': ['value', new events.EventEmitter()] }
    m = mocks.loadFile(path.join(__dirname, '/../../lib/preprocessor.js'), mocks_)
  })

  it('should preprocess matching file', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': [
        'factory', function () { return fakePreprocessor }
      ]
    }, emitterSetting])
    pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should match directories starting with a dot', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/.dir/a.js', path: 'path' }

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should check patterns after creation when invoked', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const config = { '**/*.txt': ['fake'] }
    pp = m.createPriorityPreprocessor(config, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    config['**/*.js'] = ['fake']

    pp(file, () => {
      expect(fakePreprocessor).to.have.been.called
      expect(file.path).to.equal('path-preprocessed')
      expect(file.content).to.equal('new-content')
      done()
    })
  })

  it('should ignore not matching file', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, '')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.txt', path: 'path' }

    pp(file, () => {
      expect(fakePreprocessor).to.not.have.been.called
      done()
    })
  })

  it('should apply all preprocessors', (done) => {
    const fakePreprocessor1 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p1'
      done(null, content + '-c1')
    })

    const fakePreprocessor2 = sinon.spy((content, file, done) => {
      file.path = file.path + '-p2'
      done(content + '-c2')
    })

    const injector = new di.Injector([{
      'preprocessor:fake1': ['factory', function () { return fakePreprocessor1 }],
      'preprocessor:fake2': ['factory', function () { return fakePreprocessor2 }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*.js': ['fake1', 'fake2'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, () => {
      expect(fakePreprocessor1).to.have.been.calledOnce
      expect(fakePreprocessor2).to.have.been.calledOnce
      expect(file.path).to.equal('path-p1-p2')
      expect(file.content).to.equal('content-c1-c2')
      done()
    })
  })

  it('should compute SHA', (done) => {
    pp = m.createPriorityPreprocessor({}, {}, null, new di.Injector([emitterSetting]))
    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, () => {
      expect(file.sha).to.exist
      expect(file.sha.length).to.equal(40)
      const previousSHA = file.sha

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
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content + '-processed')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/a.js': ['fake'] }, {}, null, injector)

    const fileProcess = { originalPath: '/some/a.js', path: 'path' }
    const fileSkip = { originalPath: '/some/b.js', path: 'path' }

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
    const failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    const injector = new di.Injector([{
      'preprocessor:failing': ['factory', function () { return failingPreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*.js': ['failing'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, (err) => {
      expect(err).to.exist
      done()
    })
  })

  it('should stop preprocessing after an error', (done) => {
    const failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:failing': ['factory', function () { return failingPreprocessor }],
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*.js': ['failing', 'fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, () => {
      expect(fakePreprocessor).not.to.have.been.called
      done()
    })
  })

  describe('when fs.readFile fails', () => {
    const file = { originalPath: '/some/a.js', path: 'path' }
    const getReadFileCallback = (nthCall) => {
      return mockFs.readFile.args[nthCall][1]
    }

    beforeEach(() => {
      sinon.stub(mockFs, 'readFile')
    })

    it('should retry up to 3 times', (done) => {
      const fakePreprocessor = sinon.spy((content, file, done) => {
        done(null, content)
      })

      const injector = new di.Injector([{
        'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
      }, emitterSetting])

      const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

      pp(file, () => {
        expect(fakePreprocessor).to.have.been.called
        done()
      })
      getReadFileCallback(0)('error')
      getReadFileCallback(1)('error')
      const thirdCallback = getReadFileCallback(2)
      mockFs.readFile.restore()
      thirdCallback('error')
    })

    it('should throw after 3 retries', (done) => {
      const injector = new di.Injector([{}, emitterSetting])

      const pp = m.createPriorityPreprocessor({ '**/*.js': [] }, {}, null, injector)

      pp(file, () => { })

      getReadFileCallback(0)('error')
      getReadFileCallback(1)('error')
      getReadFileCallback(2)('error')

      expect(() => getReadFileCallback(0)('error')).to.throw('error')
      done()
    })
  })

  it('should not preprocess binary files by default', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/photo.png', path: 'path' }

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })

  it('should preprocess binary files if handleBinaryFiles=true', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })
    fakePreprocessor.handleBinaryFiles = true

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/photo.png', path: 'path' }

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessor).to.have.been.calledOnce
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })

  it('should not preprocess binary files with capital letters in extension', (done) => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { fakePreprocessor }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/CAM_PHOTO.JPG', path: 'path' }

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessor).not.to.have.been.called
      expect(file.content).to.be.an.instanceof(Buffer)
      done()
    })
  })

  it('should merge lists of preprocessors using default priority', (done) => {
    const callOrder = []
    const fakePreprocessorA = sinon.spy((content, file, done) => {
      callOrder.push('a')
      done(null, content)
    })
    const fakePreprocessorB = sinon.spy((content, file, done) => {
      callOrder.push('b')
      done(null, content)
    })
    const fakePreprocessorC = sinon.spy((content, file, done) => {
      callOrder.push('c')
      done(null, content)
    })
    const fakePreprocessorD = sinon.spy((content, file, done) => {
      callOrder.push('d')
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fakeA': ['factory', function () { return fakePreprocessorA }],
      'preprocessor:fakeB': ['factory', function () { return fakePreprocessorB }],
      'preprocessor:fakeC': ['factory', function () { return fakePreprocessorC }],
      'preprocessor:fakeD': ['factory', function () { return fakePreprocessorD }]
    }, emitterSetting])

    pp = m.createPriorityPreprocessor({
      '/*/a.js': ['fakeA', 'fakeB'],
      '/some/*': ['fakeB', 'fakeC'],
      '/some/a.js': ['fakeD']
    }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessorA).to.have.been.called
      expect(fakePreprocessorB).to.have.been.called
      expect(fakePreprocessorC).to.have.been.called
      expect(fakePreprocessorD).to.have.been.called

      expect(callOrder).to.eql(['a', 'b', 'c', 'd'])
      done()
    })
  })

  it('should merge lists of preprocessors obeying priority', (done) => {
    const callOrder = []
    const fakePreprocessorA = sinon.spy((content, file, done) => {
      callOrder.push('a')
      done(null, content)
    })
    const fakePreprocessorB = sinon.spy((content, file, done) => {
      callOrder.push('b')
      done(null, content)
    })
    const fakePreprocessorC = sinon.spy((content, file, done) => {
      callOrder.push('c')
      done(null, content)
    })
    const fakePreprocessorD = sinon.spy((content, file, done) => {
      callOrder.push('d')
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fakeA': ['factory', function () { return fakePreprocessorA }],
      'preprocessor:fakeB': ['factory', function () { return fakePreprocessorB }],
      'preprocessor:fakeC': ['factory', function () { return fakePreprocessorC }],
      'preprocessor:fakeD': ['factory', function () { return fakePreprocessorD }]
    }, emitterSetting])

    const priority = { 'fakeA': -1, 'fakeB': 1, 'fakeD': 100 }

    pp = m.createPriorityPreprocessor({
      '/*/a.js': ['fakeA', 'fakeB'],
      '/some/*': ['fakeB', 'fakeC'],
      '/some/a.js': ['fakeD']
    }, priority, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    pp(file, (err) => {
      if (err) throw err

      expect(fakePreprocessorA).to.have.been.called
      expect(fakePreprocessorB).to.have.been.called
      expect(fakePreprocessorC).to.have.been.called
      expect(fakePreprocessorD).to.have.been.called

      expect(callOrder).to.eql(['d', 'b', 'c', 'a'])
      done()
    })
  })
})
