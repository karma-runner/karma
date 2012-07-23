#==============================================================================
# lib/watcher.js module
#==============================================================================
describe 'watcher', ->
  util = require '../test-util'
  mocks = require 'mocks'
  m = null

  beforeEach util.disableLogger

  beforeEach ->
    mocks_ = chokidar: mocks.chokidar
    m = mocks.loadFile __dirname + '/../../lib/watcher.js', mocks_


  #============================================================================
  # baseDirFromPattern() [PRIVATE]
  #============================================================================
  describe 'baseDirFromPattern', ->

    it 'should return parent directory without start', ->
      expect(m.baseDirFromPattern '/some/path/**/more.js').toBe '/some/path'
      expect(m.baseDirFromPattern '/some/p*/file.js').toBe '/some'


    it 'should remove part with parenthesis', ->
      expect(m.baseDirFromPattern '/some/p/(a|b).js').toBe '/some/p'
      expect(m.baseDirFromPattern '/some/p(c|b)*.js').toBe '/some'


    it 'should ignore exact files', ->
      expect(m.baseDirFromPattern '/usr/local/bin.js').toBe '/usr/local/bin.js'


  #==============================================================================
  # watchPatterns() [PRIVATE]
  #==============================================================================
  describe 'watchPatterns', ->
    chokidarWatcher = null

    beforeEach ->
      chokidarWatcher = new mocks.chokidar.FSWatcher

    it 'should watch all the patterns', ->
      m.watchPatterns ['/some/*.js', '/a.*'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).toEqual ['/some', '/']


    it 'should not watch urls', ->
      m.watchPatterns ['http://some.com', '/a.*'], chokidarWatcher
      expect(chokidarWatcher.watchedPaths_).toEqual ['/']
