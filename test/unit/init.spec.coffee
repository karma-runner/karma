#==============================================================================
# lib/init.js module
#==============================================================================
describe 'init', ->
  loadFile = require('mocks').loadFile
  path = require 'path'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/init.js', {glob: require 'glob'}
    sinon.stub m, 'installPackage'


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


  describe 'processAnswers', ->

    answers = (obj = {}) ->
      obj.files = obj.files or []
      obj.exclude = obj.exclude or []
      obj.browsers = obj.browsers or []
      obj


    it 'should add requirejs and set files non-included if requirejs used', ->
      processedAnswers = m.processAnswers answers {
        requirejs: true,
        includedFiles: ['test-main.js'],
        files: ['*.js']
      }

      expect(processedAnswers.frameworks).to.contain 'requirejs'
      expect(processedAnswers.files).to.deep.equal ['test-main.js']
      expect(processedAnswers.onlyServedFiles).to.deep.equal ['*.js']


    it 'should add coffee preprocessor', ->
      processedAnswers = m.processAnswers answers {
        files: ['src/*.coffee']
      }

      expect(processedAnswers.preprocessors).to.have.property '**/*.coffee'
      expect(processedAnswers.preprocessors['**/*.coffee']).to.deep.equal ['coffee']

