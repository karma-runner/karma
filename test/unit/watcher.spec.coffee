#==============================================================================
# lib/watcher.js module
#==============================================================================
describe 'watcher', ->
  mocks = require 'mocks'
  config = require '../../lib/config'
  m = null

  beforeEach ->
    mocks_ = chokidar: mocks.chokidar
    m = mocks.loadFile __dirname + '/../../lib/watcher.js', mocks_

  #============================================================================
  # baseDirFromPattern() [PRIVATE]
  #============================================================================
  describe 'baseDirFromPattern', ->

    it 'should return parent directory without start', ->
      expect(m.baseDirFromPattern '/some/path/**/more.js').to.equal '/some/path'
      expect(m.baseDirFromPattern '/some/p*/file.js').to.equal '/some'


    it 'should remove part with !(x)', ->
      expect(m.baseDirFromPattern '/some/p/!(a|b).js').to.equal '/some/p'
      expect(m.baseDirFromPattern '/some/p!(c|b)*.js').to.equal '/some'


    it 'should remove part with +(x)', ->
      expect(m.baseDirFromPattern '/some/p/+(a|b).js').to.equal '/some/p'
      expect(m.baseDirFromPattern '/some/p+(c|bb).js').to.equal '/some'


    it 'should remove part with (x)?', ->
      expect(m.baseDirFromPattern '/some/p/(a|b)?.js').to.equal '/some/p'
      expect(m.baseDirFromPattern '/some/p(c|b)?.js').to.equal '/some'


    it 'should allow paths with parentheses', ->
      expect(m.baseDirFromPattern '/some/x (a|b)/a.js').to.equal '/some/x (a|b)/a.js'
      expect(m.baseDirFromPattern '/some/p(c|b)/*.js').to.equal '/some/p(c|b)'


    it 'should ignore exact files', ->
      expect(m.baseDirFromPattern '/usr/local/bin.js').to.equal '/usr/local/bin.js'


  #==============================================================================
  # watchPatterns() [PRIVATE]
  #==============================================================================
  describe 'watchPatterns', ->
    chokidarWatcher = null

    beforeEach ->
      chokidarWatcher = new mocks.chokidar.FSWatcher

    it 'should watch all the patterns', ->
      m.watchPatterns ['/some/*.js', '/a/*'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some', '/a']


    it 'should not watch the same path twice', ->
      m.watchPatterns ['/some/a*.js', '/some/*.txt'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some']


    it 'should not watch subpaths that are already watched', ->
      m.watchPatterns ['/some/sub/*.js', '/some/a*.*'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some']


    it 'should watch a file matching subpath directory', ->
      # regression #521
      m.watchPatterns ['/some/test-file.js', '/some/test/**'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some/test-file.js', '/some/test']


  describe 'getWatchedPatterns', ->

    it 'should return list of watched patterns (strings)', ->
      watchedPatterns = m.getWatchedPatterns [
        config.createPatternObject('/watched.js')
        config.createPatternObject(pattern: 'non/*.js', watched: false)
      ]
      expect(watchedPatterns).to.deep.equal ['/watched.js']


  #============================================================================
  # ignore() [PRIVATE]
  #============================================================================
  describe 'ignore', ->
    FILE_STAT =
      isDirectory: -> false
      isFile: -> true
    DIRECTORY_STAT =
      isDirectory: -> true
      isFile: -> false

    it 'should ignore all files', ->
      ignore = m.createIgnore ['**/*'], ['**/*']
      expect(ignore '/some/files/deep/nested.js', FILE_STAT).to.equal true
      expect(ignore '/some/files', FILE_STAT).to.equal true


    it 'should ignore .# files', ->
      ignore = m.createIgnore ['**/*'], ['**/.#*']
      expect(ignore '/some/files/deep/nested.js', FILE_STAT).to.equal false
      expect(ignore '/some/files', FILE_STAT).to.equal false
      expect(ignore '/some/files/deep/.npm', FILE_STAT).to.equal false
      expect(ignore '.#files.js', FILE_STAT).to.equal true
      expect(ignore '/some/files/deeper/nested/.#files.js', FILE_STAT).to.equal true


    it 'should ignore files that do not match any pattern', ->
      ignore = m.createIgnore ['/some/*.js'], []
      expect(ignore '/a.js', FILE_STAT).to.equal true
      expect(ignore '/some.js', FILE_STAT).to.equal true
      expect(ignore '/some/a.js', FILE_STAT).to.equal false


    it 'should not ignore directories', ->
      ignore = m.createIgnore ['**/*'], ['**/*']
      expect(ignore '/some/dir', DIRECTORY_STAT).to.equal false


    it 'should not ignore items without stat', ->
      # before we know whether it's a directory or file, we can't ignore
      ignore = m.createIgnore ['**/*'], ['**/*']
      expect(ignore '/some.js', undefined).to.equal false
      expect(ignore '/what/ever', undefined).to.equal false
