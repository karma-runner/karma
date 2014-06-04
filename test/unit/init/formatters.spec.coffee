#==============================================================================
# lib/init/formatters.js module
#==============================================================================
describe 'init/formatters', ->
  f = require '../../../lib/init/formatters'
  formatter = null

  describe 'JavaScript', ->

    beforeEach ->
      formatter = new f.JavaScript

    describe 'formatAnswers', ->
      createAnswers = (ans = {}) ->
        ans.frameworks = ans.frameworks or []
        ans.files = ans.files or []
        ans.onlyServedFiles = ans.onlyServedFiles or []
        ans.exclude = ans.exclude or []
        ans.browsers = ans.browsers or []
        ans.preprocessors = ans.preprocessors or {}
        ans

      it 'should format FRAMEWORKS', ->
        replacements = formatter.formatAnswers createAnswers {frameworks: ['jasmine', 'requirejs']}
        expect(replacements.FRAMEWORKS).to.equal "'jasmine', 'requirejs'"


      it 'should format FILES', ->
        replacements = formatter.formatAnswers createAnswers()
        expect(replacements.FILES).to.equal ''

        replacements = formatter.formatAnswers createAnswers {files: ['*.js', 'other/file.js']}
        expect(replacements.FILES).to.equal "\n      '*.js',\n      'other/file.js'"


      it 'should format BROWSERS', ->
        replacements = formatter.formatAnswers createAnswers {browsers: ['Chrome', 'Firefox']}
        expect(replacements.BROWSERS).to.equal "'Chrome', 'Firefox'"


      it 'should format AUTO_WATCH', ->
        replacements = formatter.formatAnswers createAnswers {autoWatch: true}
        expect(replacements.AUTO_WATCH).to.equal 'true'

        replacements = formatter.formatAnswers createAnswers {autoWatch: false}
        expect(replacements.AUTO_WATCH).to.equal 'false'


      it 'should format onlyServedFiles', ->
        replacements = formatter.formatAnswers createAnswers {
          files: ['test-main.js']
          onlyServedFiles: ['src/*.js']
        }

        expect(replacements.FILES).to.equal "\n      'test-main.js',\n" +
                                      "      {pattern: 'src/*.js', included: false}"


      it 'should format PREPROCESSORS', ->
        replacements = formatter.formatAnswers createAnswers {preprocessors: '*.coffee': ['coffee']}

        expect(replacements.PREPROCESSORS).to.equal "{\n" +
                                                "      '*.coffee': ['coffee']\n" +
                                                "    }"
