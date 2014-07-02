#==============================================================================
# lib/watcher.js module
#==============================================================================
describe 'watcher', ->
  mocks = require 'mocks'
  config = require '../../lib/config'
  m = null

  beforeEach ->
    configuration = new config.Config()
    mocks_ = chokidar: mocks.chokidar
    m = mocks.loadFile __dirname + '/../../lib/watcher.js', mocks_


  describe 'getWatchedPatterns', ->

    it 'should return list of watched patterns (strings)', ->
      watchedPatterns = m.getWatchedPatterns [
        config.createPatternObject('watched.js')
        config.createPatternObject(pattern: 'non/*.js', watched: false)
      ], process.cwd()
      expect(watchedPatterns).to.deep.equal ['watched.js']

