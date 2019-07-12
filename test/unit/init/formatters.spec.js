const formatters = require('../../../lib/init/formatters')

describe('init/formatters', () => {
  let formatter

  describe('JavaScript', () => {
    beforeEach(() => {
      formatter = new formatters.JavaScript()
    })

    describe('formatAnswers', () => {
      function createAnswers (ans) {
        ans = ans || {}
        ans.frameworks = ans.frameworks || []
        ans.files = ans.files || []
        ans.onlyServedFiles = ans.onlyServedFiles || []
        ans.exclude = ans.exclude || []
        ans.browsers = ans.browsers || []
        ans.preprocessors = ans.preprocessors || {}
        return ans
      }

      it('should format FRAMEWORKS', () => {
        const replacements = formatter.formatAnswers(createAnswers({ frameworks: ['jasmine', 'requirejs'] }))
        expect(replacements.FRAMEWORKS).to.equal("'jasmine', 'requirejs'")
      })

      it('should format FILES', () => {
        let replacements = formatter.formatAnswers(createAnswers())
        expect(replacements.FILES).to.equal('')

        replacements = formatter.formatAnswers(createAnswers({ files: ['*.js', 'other/file.js'] }))
        expect(replacements.FILES).to.equal(
          "\n      '*.js',\n      'other/file.js'"
        )
      })

      it('should format BROWSERS', () => {
        const replacements = formatter.formatAnswers(createAnswers({ browsers: ['Chrome', 'Firefox'] }))
        expect(replacements.BROWSERS).to.equal("'Chrome', 'Firefox'")
      })

      it('should format AUTO_WATCH', () => {
        let replacements = formatter.formatAnswers(createAnswers({ autoWatch: true }))
        expect(replacements.AUTO_WATCH).to.equal('true')

        replacements = formatter.formatAnswers(createAnswers({ autoWatch: false }))
        expect(replacements.AUTO_WATCH).to.equal('false')
      })

      it('should format onlyServedFiles', () => {
        const replacements = formatter.formatAnswers(createAnswers({
          files: ['test-main.js'],
          onlyServedFiles: ['src/*.js']
        }))

        expect(replacements.FILES).to.equal(
          "\n      'test-main.js',\n      { pattern: 'src/*.js', included: false }"
        )
      })

      it('should format PREPROCESSORS', () => {
        const replacements = formatter.formatAnswers(createAnswers({ preprocessors: { '*.coffee': ['coffee'] } }))

        expect(replacements.PREPROCESSORS).to.equal(
          "\n      '*.coffee': ['coffee']"
        )
      })
    })
  })
})
