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
      expect(m.getBasePath 'some.conf', replace('/usr/local/whatever')).toBe ''


    it 'should handle leading "./', ->
      expect(m.getBasePath replace('./some.conf'), replace('/usr/local/whatever')).toBe ''


    it 'should handle config file in subfolder', ->
      # config /usr/local/sub/folder/file.conf
      file = replace('sub/folder/file.conf')
      expect(m.getBasePath file, replace('/usr/local')).toBe replace('../..')


    it 'should handle config in a parent path', ->
      # config /home/file.js
      file = replace('../../../file.js')
      expect(m.getBasePath file, replace('/home/vojta/tc/project')).toBe replace('vojta/tc/project')


    it 'should handle config in parent subfolder', ->
      # config /home/vojta/other/f.js
      f = replace('../../other/f.js')
      expect(m.getBasePath f, replace('/home/vojta/tc/prj')).toBe replace('../tc/prj')


    it 'should handle absolute paths', ->
      expect(m.getBasePath replace('/Users/vojta/testacular/conf.js'), replace('/Users/vojta')).toBe replace('..')


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
