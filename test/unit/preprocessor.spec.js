'use strict'

const mocks = require('mocks')
const di = require('di')
const path = require('path')

const events = require('../../lib/events')

describe('preprocessor', () => {
  let m
  let mockFs
  let emitterSetting
  // mimic first few bytes of a pdf file
  const binarydata = Buffer.from([0x25, 0x50, 0x44, 0x66, 0x46, 0x00])

  beforeEach(() => {
    mockFs = mocks.fs.create({
      some: {
        'a.js': mocks.fs.file(0, 'content'),
        'b.js': mocks.fs.file(0, 'content'),
        'a.txt': mocks.fs.file(0, 'some-text'),
        'photo.png': mocks.fs.file(0, binarydata),
        'CAM_PHOTO.JPG': mocks.fs.file(0, binarydata),
        'proto.pb': mocks.fs.file(0, Buffer.from('mixed-content', 'utf8')),
        '.dir': {
          'a.js': mocks.fs.file(0, 'content')
        }
      }
    })

    const mocks_ = {
      'graceful-fs': mockFs,
      minimatch: require('minimatch')
    }
    emitterSetting = { emitter: ['value', new events.EventEmitter()] }
    m = mocks.loadFile(path.join(__dirname, '/../../lib/preprocessor.js'), mocks_)
  })

  it('should preprocess matching file', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': [
        'factory', function () { return fakePreprocessor }
      ]
    }, emitterSetting])
    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.have.been.called
    expect(file.path).to.equal('path-preprocessed')
    expect(file.content).to.equal('new-content')
  })

  it('should match directories starting with a dot', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/.dir/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.have.been.called
    expect(file.path).to.equal('path-preprocessed')
    expect(file.content).to.equal('new-content')
  })

  it('should get content if preprocessor is an async function or return Promise with content', async () => {
    const fakePreprocessor = sinon.spy(async (content, file, done) => {
      file.path = file.path + '-preprocessed'
      return 'new-content'
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/.dir/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.have.been.called
    expect(file.path).to.equal('path-preprocessed')
    expect(file.content).to.equal('new-content')
  })

  it('should get content if preprocessor is an async function still calling done()', async () => {
    const fakePreprocessor = sinon.spy(async (content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/.dir/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.have.been.called
    expect(file.path).to.equal('path-preprocessed')
    expect(file.content).to.equal('new-content')
  })

  it('should check patterns after creation when invoked', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      file.path = file.path + '-preprocessed'
      done(null, 'new-content')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const config = { '**/*.txt': ['fake'] }
    const pp = m.createPriorityPreprocessor(config, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    config['**/*.js'] = ['fake']

    await pp(file)
    expect(fakePreprocessor).to.have.been.called
    expect(file.path).to.equal('path-preprocessed')
    expect(file.content).to.equal('new-content')
  })

  it('should ignore not matching file', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, '')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])
    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.txt', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.not.have.been.called
  })

  it('should apply all preprocessors', async () => {
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

    const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake1', 'fake2'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessor1).to.have.been.calledOnce
    expect(fakePreprocessor2).to.have.been.calledOnce
    expect(file.path).to.equal('path-p1-p2')
    expect(file.content).to.equal('content-c1-c2')
  })

  it('should compute SHA', async () => {
    const pp = m.createPriorityPreprocessor({}, {}, null, new di.Injector([emitterSetting]))
    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file)
    expect(file.sha).to.exist
    expect(file.sha.length).to.equal(40)
    const previousSHA = file.sha

    await pp(file)
    expect(file.sha).to.equal(previousSHA)
    mockFs._touchFile('/some/a.js', null, 'new-content')

    await pp(file)
    expect(file.sha.length).to.equal(40)
    expect(file.sha).not.to.equal(previousSHA)
  })

  it('should compute SHA from content returned by a processor', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content + '-processed')
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/a.js': ['fake'] }, {}, null, injector)

    const fileProcess = { originalPath: '/some/a.js', path: 'path' }
    const fileSkip = { originalPath: '/some/b.js', path: 'path' }

    await pp(fileProcess)
    await pp(fileSkip)
    expect(fileProcess.sha).to.exist
    expect(fileProcess.sha.length).to.equal(40)
    expect(fileSkip.sha).to.exist
    expect(fileSkip.sha.length).to.equal(40)
    expect(fileProcess.sha).not.to.equal(fileSkip.sha)
  })

  it('should return error if any preprocessor fails', () => {
    const failingPreprocessor = sinon.spy((content, file, done) => {
      done(new Error('Some error'), null)
    })

    const injector = new di.Injector([{
      'preprocessor:failing': ['factory', function () { return failingPreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*.js': ['failing'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    return pp(file).then(() => {
      throw new Error('Should be failed')
    }, (err) => {
      expect(err).to.exist
    })
  })

  it('should stop preprocessing after an error', async () => {
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

    const pp = m.createPriorityPreprocessor({ '**/*.js': ['failing', 'fake'] }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file).then(() => {
      throw new Error('should be failed')
    }, (err) => {
      expect(err.message).to.equal('Some error')
    })
    expect(fakePreprocessor).not.to.have.been.called
  })

  describe('when fs.readFile fails', () => {
    const file = { originalPath: '/some/a.js', path: 'path' }

    beforeEach(() => {
      sinon.stub(mockFs, 'readFileSync').throwsException('error')
    })

    it('should retry up to 3 times', async () => {
      const fakePreprocessor = sinon.spy((content, file, done) => {
        done(null, content)
      })

      const injector = new di.Injector([{
        'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
      }, emitterSetting])

      const pp = m.createPriorityPreprocessor({ '**/*.js': ['fake'] }, {}, null, injector)

      await pp(file).then(() => {
        throw new Error('Should be rejected')
      }, () => {
        // 3 times repeated and 1 the first execution
        expect(mockFs.readFileSync.callCount).to.equal(4)
        expect(fakePreprocessor.notCalled).to.be.true
        mockFs.readFileSync.restore()
      })
    })

    it('should throw after 3 retries', async () => {
      const injector = new di.Injector([{}, emitterSetting])

      const pp = m.createPriorityPreprocessor({ '**/*.js': [] }, {}, null, injector)

      await pp(file).then(() => {
        throw new Error('Should be rejected')
      }, () => {
        expect(mockFs.readFileSync.callCount).to.equal(4)
        mockFs.readFileSync.restore()
      })
    })
  })

  it('should not preprocess binary files by default', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/photo.png', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).not.to.have.been.called
    expect(file.content).to.be.an.instanceof(Buffer)
  })

  it('should not preprocess files configured to be binary', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/proto.pb', path: 'path', isBinary: true }

    await pp(file)
    expect(fakePreprocessor).not.to.have.been.called
    expect(file.content).to.be.an.instanceof(Buffer)
  })

  it('should preprocess files configured not to be binary', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    // Explicit false for isBinary
    const file = { originalPath: '/some/proto.pb', path: 'path', isBinary: false }

    await pp(file)
    expect(fakePreprocessor).to.have.been.calledOnce
    expect(typeof file.content).to.equal('string')
  })

  it('should preprocess binary files if handleBinaryFiles=true', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })
    fakePreprocessor.handleBinaryFiles = true

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { return fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/photo.png', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).to.have.been.calledOnce
    expect(file.content).to.be.an.instanceof(Buffer)
  })

  it('should not preprocess binary files with capital letters in extension', async () => {
    const fakePreprocessor = sinon.spy((content, file, done) => {
      done(null, content)
    })

    const injector = new di.Injector([{
      'preprocessor:fake': ['factory', function () { fakePreprocessor }]
    }, emitterSetting])

    const pp = m.createPriorityPreprocessor({ '**/*': ['fake'] }, {}, null, injector)

    const file = { originalPath: '/some/CAM_PHOTO.JPG', path: 'path' }

    await pp(file)
    expect(fakePreprocessor).not.to.have.been.called
    expect(file.content).to.be.an.instanceof(Buffer)
  })

  it('should merge lists of preprocessors using default priority', async () => {
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

    const pp = m.createPriorityPreprocessor({
      '/*/a.js': ['fakeA', 'fakeB'],
      '/some/*': ['fakeB', 'fakeC'],
      '/some/a.js': ['fakeD']
    }, {}, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessorA).to.have.been.called
    expect(fakePreprocessorB).to.have.been.called
    expect(fakePreprocessorC).to.have.been.called
    expect(fakePreprocessorD).to.have.been.called

    expect(callOrder).to.eql(['a', 'b', 'c', 'd'])
  })

  it('should merge lists of preprocessors obeying priority', async () => {
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

    const priority = { fakeA: -1, fakeB: 1, fakeD: 100 }

    const pp = m.createPriorityPreprocessor({
      '/*/a.js': ['fakeA', 'fakeB'],
      '/some/*': ['fakeB', 'fakeC'],
      '/some/a.js': ['fakeD']
    }, priority, null, injector)

    const file = { originalPath: '/some/a.js', path: 'path' }

    await pp(file)
    expect(fakePreprocessorA).to.have.been.called
    expect(fakePreprocessorB).to.have.been.called
    expect(fakePreprocessorC).to.have.been.called
    expect(fakePreprocessorD).to.have.been.called

    expect(callOrder).to.eql(['d', 'b', 'c', 'a'])
  })
})
