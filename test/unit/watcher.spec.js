const mocks = require('mocks')
const path = require('path')

describe('watcher', () => {
  const config = require('../../lib/config')

  let m = null

  beforeEach(() => {
    const mocks_ = { chokidar: mocks.chokidar }
    m = mocks.loadFile(path.join(__dirname, '/../../lib/watcher.js'), mocks_)
  })

  describe('watchPatterns', () => {
    let chokidarWatcher = null

    beforeEach(() => {
      chokidarWatcher = new mocks.chokidar.FSWatcher()
    })

    it('should watch all the patterns', () => {
      m.watchPatterns(['/some/*.js', '/a/*'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some', '/a'])
    })

    it('should expand braces and watch all the patterns', () => {
      m.watchPatterns(['/some/{a,b}/*.js', '/a/*'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some/a', '/some/b', '/a'])
    })

    it('should not watch the same path twice', () => {
      m.watchPatterns(['/some/a*.js', '/some/*.txt'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some'])
    })

    it('should not watch the same path twice when using braces', () => {
      m.watchPatterns(['/some/*.{js,txt}'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some'])
    })

    it('should not watch subpaths that are already watched', () => {
      m.watchPatterns(['/some/sub/*.js', '/some/a*.*'].map(path.normalize), chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal([path.normalize('/some')])
    })

    it('should watch a file matching subpath directory', () => {
      // regression #521
      m.watchPatterns(['/some/test-file.js', '/some/test/**'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some/test-file.js', '/some/test'])
    })

    it('should watch files matching a subpath directory with braces', () => {
      m.watchPatterns(['/some/{a,b}/test.js'], chokidarWatcher)
      expect(chokidarWatcher.watchedPaths_).to.deep.equal(['/some/a/test.js', '/some/b/test.js'])
    })
  })

  describe('getWatchedPatterns', () => {
    it('should return list of watched patterns (strings)', () => {
      const watchedPatterns = m.getWatchedPatterns([
        config.createPatternObject('/watched.js'),
        config.createPatternObject({ pattern: 'non/*.js', watched: false })
      ])
      expect(watchedPatterns).to.deep.equal(['/watched.js'])
    })
  })

  describe('ignore', () => {
    const FILE_STAT = {
      isDirectory: () => false,
      isFile: () => true
    }

    const DIRECTORY_STAT = {
      isDirectory: () => true,
      isFile: () => false
    }

    it('should ignore all files', () => {
      const ignore = m.createIgnore(['**/*'], ['**/*'])
      expect(ignore('/some/files/deep/nested.js', FILE_STAT)).to.equal(true)
      expect(ignore('/some/files', FILE_STAT)).to.equal(true)
    })

    it('should ignore .# files', () => {
      const ignore = m.createIgnore(['**/*'], ['**/.#*'])
      expect(ignore('/some/files/deep/nested.js', FILE_STAT)).to.equal(false)
      expect(ignore('/some/files', FILE_STAT)).to.equal(false)
      expect(ignore('/some/files/deep/.npm', FILE_STAT)).to.equal(false)
      expect(ignore('.#files.js', FILE_STAT)).to.equal(true)
      expect(ignore('/some/files/deeper/nested/.#files.js', FILE_STAT)).to.equal(true)
    })

    it('should ignore files that do not match any pattern', () => {
      const ignore = m.createIgnore(['/some/*.js'], [])
      expect(ignore('/a.js', FILE_STAT)).to.equal(true)
      expect(ignore('/some.js', FILE_STAT)).to.equal(true)
      expect(ignore('/some/a.js', FILE_STAT)).to.equal(false)
    })

    it('should not ignore directories', () => {
      const ignore = m.createIgnore(['**/*'], ['**/*'])
      expect(ignore('/some/dir', DIRECTORY_STAT)).to.equal(false)
    })

    it('should not ignore items without stat', () => {
      // before we know whether it's a directory or file, we can't ignore
      const ignore = m.createIgnore(['**/*'], ['**/*'])
      expect(ignore('/some.js', undefined)).to.equal(false)
      expect(ignore('/what/ever', undefined)).to.equal(false)
    })
  })
})
