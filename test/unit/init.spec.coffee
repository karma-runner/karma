#==============================================================================
# lib/init.js module
#==============================================================================
describe 'init', ->
  loadFile = require('mocks').loadFile
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/init.js', {glob: require 'glob'}

  describe 'getBasePath', ->

    it 'should be empty if config file in cwd', ->
      expect(m.getBasePath 'some.conf', '/usr/local/whatever').toBe ''


    it 'should handle leading "./', ->
      expect(m.getBasePath './some.conf', '/usr/local/whatever').toBe ''


    it 'should handle config file in subfolder', ->
      # config /usr/local/sub/folder/file.conf
      expect(m.getBasePath 'sub/folder/file.conf', '/usr/local').toBe '../..'


    it 'should handle config in a parent path', ->
      # config /home/file.js
      expect(m.getBasePath '../../../file.js', '/home/vojta/tc/project').toBe 'vojta/tc/project'


    it 'should handle config in parent subfolder', ->
      # config /home/vojta/other/f.js
      expect(m.getBasePath '../../other/f.js', '/home/vojta/tc/prj').toBe '../tc/prj'


  describe 'getReplacementsFromAnswers', ->

    answers = (obj = {}) ->
      obj.files = obj.files or []
      obj.exclude = obj.exclude or []
      obj.browsers = obj.browsers or []
      obj

    it 'should set FILES', ->
      # empty
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.FILES).toBe ''

      replacements = m.getReplacementsFromAnswers answers {files: ['*.js', 'other/file.js']}
      expect(replacements.FILES).toBe "'*.js',\n  'other/file.js'"

      # prepend testing framework files
      replacements = m.getReplacementsFromAnswers answers {files: ['*.js'], framework: 'jasmine'}
      expect(replacements.FILES).toBe "JASMINE,\n  JASMINE_ADAPTER,\n  '*.js'"
      replacements = m.getReplacementsFromAnswers answers {files: ['*.js'], framework: 'mocha'}
      expect(replacements.FILES).toBe "MOCHA,\n  MOCHA_ADAPTER,\n  '*.js'"


    it 'should set EXCLUDE', ->
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.EXCLUDE).toBe ''

      replacements = m.getReplacementsFromAnswers answers {exclude: ['*.js', 'other/file.js']}
      expect(replacements.EXCLUDE).toBe "'*.js',\n  'other/file.js'"


    it 'should set BROWSERS', ->
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.BROWSERS).toBe ''

      replacements = m.getReplacementsFromAnswers answers {browsers: ['Chrome', 'Firefox']}
      expect(replacements.BROWSERS).toBe "'Chrome', 'Firefox'"


    it 'should set AUTO_WATCH', ->
      replacements = m.getReplacementsFromAnswers answers {autoWatch: 'yes'}
      expect(replacements.AUTO_WATCH).toBe 'true'

      replacements = m.getReplacementsFromAnswers answers {autoWatch: 'no'}
      expect(replacements.AUTO_WATCH).toBe 'false'
