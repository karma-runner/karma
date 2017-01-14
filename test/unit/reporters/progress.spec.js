describe('reporter', function () {
  var ProgressReporter = require('../../../lib/reporters/progress')

  describe('Progress', function () {
    var reporter
    var formatError

    beforeEach(function () {
      formatError = sinon.spy()
      reporter = new ProgressReporter(formatError, null, false, {terminal: true})
    })

    it('should turn off colors', function () {
      expect(reporter.EXCLUSIVELY_USE_COLORS).to.equal(false)
    })

    it('should prepare state on run tests', function () {
      sinon.stub(reporter, 'write')
      sinon.stub(reporter, 'renderBrowser')

      reporter.onRunStart()
      reporter.onBrowserStart(createBrowserMock())

      reporter.onRunStart()

      expect(reporter._browsers.length).to.equal(0)
      expect(reporter._isRendered).to.equal(false)
    })

    it('should not throw exception if browser exit with error without run tests', function () {
      sinon.stub(reporter, 'write')
      sinon.stub(reporter, 'renderBrowser')

      expect(function () {
        reporter.onBrowserError(createBrowserMock())
      }).to.not.throw()
    })

    function createBrowserMock () {
      return {}
    }
  })
})
