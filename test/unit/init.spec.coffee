#==============================================================================
# lib/init.js module
#==============================================================================
describe 'init', ->
  loadFile = require('mocks').loadFile
  path = require 'path'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/init.js', {glob: require 'glob'}


  describe 'StateMachine', ->
    machine = done = null

    mockRli =
      write: -> null
      prompt: -> null
      _deleteLineLeft: -> null
      _deleteLineRight: -> null

    beforeEach ->
      machine = new m.StateMachine mockRli
      done = sinon.spy()
      
    it 'should go through all the questions', ->
      questions = [
        {id: 'framework', options: ['jasmine', 'mocha']}
        {id: 'other'}
      ]

      done = sinon.spy (answers) ->
        expect(answers.framework).to.equal 'jasmine'
        expect(answers.other).to.equal 'abc'

      machine.process questions, done
      machine.onLine 'jasmine'
      machine.onLine 'abc'
      expect(done).to.have.been.called


    it 'should allow multiple answers', ->
      questions = [
        {id: 'browsers', multiple: true}
      ]

      done = sinon.spy (answers) ->
        expect(answers.browsers).to.deep.equal ['Chrome', 'Safari']

      machine.process questions, done
      machine.onLine 'Chrome'
      machine.onLine 'Safari'
      machine.onLine ''
      expect(done).to.have.been.called


    it 'should always return array for multiple', ->
      questions = [
        {id: 'empty', multiple: true}
      ]

      done = sinon.spy (answers) ->
        expect(answers.empty).to.deep.equal []

      machine.process questions, done
      machine.onLine ''
      expect(done).to.have.been.called


    it 'should validate answers', ->
      validator = sinon.spy()
      questions = [
        {id: 'validated', validate: validator}
      ]

      machine.process questions, done
      machine.onLine 'something'

      expect(done).to.have.been.called
      expect(validator).to.have.been.calledWith 'something'


    it 'should allow conditional answers', ->
      ifTrue = sinon.spy (answers) ->
        answers.first is 'true'
      ifFalse = sinon.spy (answers) ->
        answers.first is 'false'

      done = sinon.spy (answers) ->
        expect(answers.first).to.equal 'true'
        expect(answers.onlyIfTrue).to.equal 'something'
        expect(answers.onlyIfFalse).to.not.exist

      questions = [
        {id: 'first'}
        {id: 'onlyIfTrue', condition: ifTrue}
        {id: 'onlyIfFalse', condition: ifFalse}
      ]

      machine.process questions, done
      machine.onLine 'true'
      machine.onLine 'something'

      expect(done).to.have.been.called


    it 'should parse booleans', ->
      done = sinon.spy (answers) ->
        expect(answers.yes).to.equal true
        expect(answers.no).to.equal false

      questions = [
        {id: 'yes', options: ['yes', 'no'], boolean: true}
        {id: 'no', options: ['yes', 'no'], boolean: true}
      ]

      machine.process questions, done
      machine.onLine 'yes'
      machine.onLine 'no'

      expect(done).to.have.been.called



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
      file = replace('../../../file.js')
      expect(m.getBasePath file, replace('/home/vojta/tc/project')).to.equal replace('vojta/tc/project')


    it 'should handle config in parent subfolder', ->
      # config /home/vojta/other/f.js
      f = replace('../../other/f.js')
      expect(m.getBasePath f, replace('/home/vojta/tc/prj')).to.equal replace('../tc/prj')


    it 'should handle absolute paths', ->
      expect(m.getBasePath replace('/Users/vojta/testacular/conf.js'), replace('/Users/vojta')).to.equal replace('..')


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
      expect(replacements.FILES).to.equal "'*.js',\n  'other/file.js'"

      # prepend testing framework files
      replacements = m.getReplacementsFromAnswers answers {files: ['*.js'], framework: 'jasmine'}
      expect(replacements.FILES).to.equal "JASMINE,\n  JASMINE_ADAPTER,\n  '*.js'"
      replacements = m.getReplacementsFromAnswers answers {files: ['*.js'], framework: 'mocha'}
      expect(replacements.FILES).to.equal "MOCHA,\n  MOCHA_ADAPTER,\n  '*.js'"


    it 'should add REQUIRE and set files non-included if requirejs used', ->
      replacements = m.getReplacementsFromAnswers answers {
        requirejs: true,
        includedFiles: [],
        files: ['*.js', 'other/file.js']
      }

      expect(replacements.FILES).to.equal "REQUIRE,\n" +
        "  REQUIRE_ADAPTER,\n" +
        "  {pattern: '*.js', included: false},\n" +
        "  {pattern: 'other/file.js', included: false}"


    it 'should prepend includedFiles into FILES', ->
      replacements = m.getReplacementsFromAnswers answers {
        requirejs: true,
        includedFiles: ['main.js']
        files: ['*.js']
      }

      expect(replacements.FILES).to.equal "REQUIRE,\n" +
        "  REQUIRE_ADAPTER,\n" +
        "  'main.js',\n" +
        "  {pattern: '*.js', included: false}"


    it 'should set EXCLUDE', ->
      replacements = m.getReplacementsFromAnswers answers()
      expect(replacements.EXCLUDE).to.equal ''

      replacements = m.getReplacementsFromAnswers answers {exclude: ['*.js', 'other/file.js']}
      expect(replacements.EXCLUDE).to.equal "'*.js',\n  'other/file.js'"


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
