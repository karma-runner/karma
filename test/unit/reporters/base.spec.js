import path from 'path'

describe('reporter', function () {
  var loadFile = require('mocks').loadFile
  var m = null

  beforeEach(function () {
    m = loadFile(path.join(__dirname, '/../../../lib/reporters/base.js'))
    return m
  })

  return describe('Progress', function () {
    var reporter
    var adapter = reporter = null

    beforeEach(function () {
      adapter = sinon.spy()
      reporter = new m.BaseReporter(null, null, false, {terminal: true}, adapter)
      return reporter
    })

    it('should write to all registered adapters', function () {
      var anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)

      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.have.been.calledWith('some')
    })

    it('should omit adapters not using the right color', function () {
      var anotherAdapter = sinon.spy()
      anotherAdapter.colors = true
      reporter.EXCLUSIVELY_USE_COLORS = false
      reporter.adapters.push(anotherAdapter)
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should not call non-colored adapters when wrong default setting', function () {
      var reporter = new m.BaseReporter(null, null, true, {}, adapter)
      var anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)
      reporter.EXCLUSIVELY_USE_COLORS = false
      reporter.write('some')
      expect(adapter).to.not.have.been.called
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should call colored adapters regardless of default setting', function () {
      var reporter = new m.BaseReporter(null, null, true, {}, adapter)
      var anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)
      reporter.EXCLUSIVELY_USE_COLORS = false
      adapter.colors = false
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should call all adapters if EXCLUSIVELY_USE_COLORS is undefined', function () {
      var anotherAdapter = sinon.spy()
      anotherAdapter.colors = true
      reporter.adapters.push(anotherAdapter)
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      expect(anotherAdapter).to.have.been.calledWith('some')
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
