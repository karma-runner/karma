var path = require('path')

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

    it('should not log if lower priority than browserConsoleLogOptions "error"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'error',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'WARN')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "warn"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'warn',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "log"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'log',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'INFO')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "info"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'info',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'DEBUG')

      return writeSpy.should.have.not.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "warn"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'warn',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'ERROR')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "log"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'log',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'WARN')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "info"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'info',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "debug"', function () {
      var reporter = new m.BaseReporter(null, null, true, {
        level: 'debug',
        terminal: true
      }, adapter)
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'INFO')

      return writeSpy.should.have.been.called
    })

    return it('should format log messages correctly for multi browsers', function () {
      var writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome', 'Firefox']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return expect(writeSpy).to.have.been.calledWith('Chrome LOG: Message\n')
    })
  })
})
