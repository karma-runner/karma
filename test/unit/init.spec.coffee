#==============================================================================
# lib/init.js module
#==============================================================================
describe 'init', ->
  loadFile = require('mocks').loadFile
  path = require 'path'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/init.js', {glob: require 'glob'}


  describe 'getBasePath', ->

    # just for windows.
    replace = (p) -> p.replace(/\//g, path.sep)

    it 'should be empty if config file in cwd', ->
      expect(m.getBasePath 'some.conf', replace('/usr/local/whatever')).to.equal ''


    it 'should handle leading "./', ->
      expect(m.getBasePath replace('./some.conf'), replace('/usr/local/whatever')).to.equal ''


    it 'should handle config file in subfolder', ->
      # config /usr/local/sub/folder/file.conf
      file = replace('sub/folder/file.conf')
      expect(m.getBasePath file, replace('/usr/local')).to.equal replace('../..')


    it 'should handle config in a parent path', ->
      # config /home/file.js
      basePath = m.getBasePath replace('../../../file.js'), replace('/home/vojta/tc/project')
      expect(basePath).to.equal replace('vojta/tc/project')


    it 'should handle config in parent subfolder', ->
      # config /home/vojta/other/f.js
      f = replace('../../other/f.js')
      expect(m.getBasePath f, replace('/home/vojta/tc/prj')).to.equal replace('../tc/prj')


    it 'should handle absolute paths', ->
      basePath = m.getBasePath replace('/Users/vojta/karma/conf.js'), replace('/Users/vojta')
      expect(basePath).to.equal replace('..')


  describe 'getReplacementsFromAnswers', ->

    answers = (obj = {}) ->
      obj.files = obj.files or []
      obj.exclude = obj.exclude or []
      obj.browsers = obj.browsers or []
      obj

    it 'should set FILES', ->
      # empty
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.FILES).to.equal ''

      replacements = m.getReplacementsFromAnswers answers {files: ['*.js', 'other/file.js']}
      expect(replacements.FILES).to.equal "'*.js',\n      'other/file.js'"


    it 'should set FRAMEWORKS', ->
      replacements = m.getReplacementsFromAnswers answers {
        framework: 'mocha',
        requirejs: true
      }

      expect(replacements.FRAMEWORKS).to.equal "'mocha', 'requirejs'"


    it 'should add requirejs and set files non-included if requirejs used', ->
      replacements = m.getReplacementsFromAnswers answers {
        requirejs: true,
        includedFiles: [],
        files: ['*.js', 'other/file.js']
      }

      expect(replacements.FRAMEWORKS).to.contain "'requirejs'"

      expect(replacements.FILES).to.equal "" +
        "{pattern: '*.js', included: false},\n      " +
        "{pattern: 'other/file.js', included: false}"


    it 'should prepend includedFiles into FILES', ->
      replacements = m.getReplacementsFromAnswers answers {
        requirejs: true,
        includedFiles: ['main.js']
        files: ['*.js']
      }

      expect(replacements.FILES).to.equal "" +
        "'main.js',\n      " +
        "{pattern: '*.js', included: false}"


    it 'should set EXCLUDE', ->
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.EXCLUDE).to.equal ''

      replacements = m.getReplacementsFromAnswers answers {exclude: ['*.js', 'other/file.js']}
      expect(replacements.EXCLUDE).to.equal "'*.js',\n      'other/file.js'"


    it 'should set BROWSERS', ->
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.BROWSERS).to.equal ''

      replacements = m.getReplacementsFromAnswers answers {browsers: ['Chrome', 'Firefox']}
      expect(replacements.BROWSERS).to.equal "'Chrome', 'Firefox'"


    it 'should set AUTO_WATCH', ->
      replacements = m.getReplacementsFromAnswers answers {autoWatch: true}
      expect(replacements.AUTO_WATCH).to.equal 'true'

      replacements = m.getReplacementsFromAnswers answers {autoWatch: false}
      expect(replacements.AUTO_WATCH).to.equal 'false'
