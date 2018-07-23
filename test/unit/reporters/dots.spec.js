describe('reporter', function () {
  var DotsReporter = require('../../../lib/reporters/dots')

  describe('Dots', function () {
    var reporter
    var formatError

    beforeEach(function () {
      formatError = sinon.spy()
      reporter = new DotsReporter(formatError, null, false, {terminal: true})
    })

    it('should not log messages when complete', () => {
      const writeSpy = sinon.spy(reporter, 'write')
      const mockResults = {error: false, disconnected: false}

      reporter.onRunComplete(['Chrome'], mockResults)
      return writeSpy.should.not.have.been.called
    })

    it('should not log messages when fail', () => {
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')
      const mockResult = {description: 'description', suite: ['suite name'], log: []}

      reporter.specFailure('Chrome', mockResult)
      return writeSpy.should.not.have.been.called
    })
  })
})
