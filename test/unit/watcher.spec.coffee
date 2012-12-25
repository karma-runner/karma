#==============================================================================
# lib/watcher.js module
#==============================================================================
describe 'watcher', ->
  mocks = require 'mocks'
  config = require '../../lib/config'
  m = null

  # create an array of pattern objects from given strings
  patterns = (strings...) ->
    new config.createPatternObject(str) for str in strings

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


    it 'should remove part with parenthesis', ->
      expect(m.baseDirFromPattern '/some/p/(a|b).js').to.equal '/some/p'
      expect(m.baseDirFromPattern '/some/p(c|b)*.js').to.equal '/some'


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
      m.watchPatterns patterns('/some/*.js', '/a/*'), chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some', '/a']


    it 'should not watch urls', ->
      m.watchPatterns patterns('http://some.com', '/a.*'), chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/']


    it 'should not watch the same path twice', ->
      m.watchPatterns patterns('/some/a*.js', '/some/*.txt'), chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some']


    it 'should not watch subpaths that are already watched', ->
      m.watchPatterns patterns('/some/sub/*.js', '/some/a*.*'), chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some']


    it 'should not watch if watched false', ->
      m.watchPatterns [
        new config.Pattern('/some/*.js', true, true, false)
        new config.Pattern('/some/sub/*.js')
      ], chokidarWatcher
      
      expect(chokidarWatcher.watchedPaths_).to.deep.equal ['/some/sub']      

  #============================================================================
  # ignore() [PRIVATE]
  #============================================================================
  describe 'ignore', ->

    it 'should ignore all files', ->
      ignore = m.createIgnore ['**/*']
      expect(ignore '/some/files/deep/nested.js').to.equal true
      expect(ignore '/some/files').to.equal true


    it 'should ignore .# files', ->
      ignore = m.createIgnore ['**/.#*']
      expect(ignore '/some/files/deep/nested.js').to.equal false
      expect(ignore '/some/files').to.equal false
      expect(ignore '/some/files/deep/.npm').to.equal false
      expect(ignore '.#files.js').to.equal true
      expect(ignore '/some/files/deeper/nested/.#files.js').to.equal true


