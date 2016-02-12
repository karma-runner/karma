// ==============================================================================
// lib/reporters/Base.js module
// ==============================================================================
describe('reporter', function () {
  var loadFile = require('mocks').loadFile
  var m = null

  beforeEach(function () {
    m = loadFile(__dirname + '/../../../lib/reporters/base.js')
    return m
  })

  return describe('Progress', function () {
    var reporter
    var adapter = reporter = null

    beforeEach(function () {
      adapter = sinon.spy()
      reporter = new m.BaseReporter(null, null, adapter)
      return reporter
    })

    it('should write to all registered adapters', function () {
      var anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)

      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.have.been.calledWith('some')
    })

    it('should format', function () {
      reporter.write('Success: %d Failure: %d', 10, 20)

      return expect(adapter).to.have.been.calledWith('Success: 10 Failure: 20')
    })

    it('should format log messages correctly for single browser', function () {
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return expect(writeSpy).to.have.been.calledWith('LOG: Message\n')
    })

    return it('should format log messages correctly for multi browsers', function () {
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome', 'Firefox']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return expect(writeSpy).to.have.been.calledWith('Chrome LOG: Message\n')
    })
  })
})
