'use strict'

describe('reporter', () => {
  const BaseReporter = require('../../../lib/reporters/base')

  describe('Base', () => {
    let reporter
    let adapter = reporter = null

    beforeEach(() => {
      adapter = sinon.spy()
      reporter = new BaseReporter(null, null, false, { terminal: true }, adapter)
      return reporter
    })

    it('should write to all registered adapters', () => {
      const anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)

      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.have.been.calledWith('some')
    })

    it('should omit adapters not using the right color', () => {
      const anotherAdapter = sinon.spy()
      anotherAdapter.colors = true
      reporter.EXCLUSIVELY_USE_COLORS = false
      reporter.adapters.push(anotherAdapter)
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should not call non-colored adapters when wrong default setting', () => {
      const reporter = new BaseReporter(null, null, true, {}, adapter)
      const anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)
      reporter.EXCLUSIVELY_USE_COLORS = false
      reporter.write('some')
      expect(adapter).to.not.have.been.called
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should call colored adapters regardless of default setting', () => {
      const reporter = new BaseReporter(null, null, true, {}, adapter)
      const anotherAdapter = sinon.spy()
      reporter.adapters.push(anotherAdapter)
      reporter.EXCLUSIVELY_USE_COLORS = false
      adapter.colors = false
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      return expect(anotherAdapter).to.not.have.been.called
    })

    it('should call all adapters if EXCLUSIVELY_USE_COLORS is undefined', () => {
      const anotherAdapter = sinon.spy()
      anotherAdapter.colors = true
      reporter.adapters.push(anotherAdapter)
      reporter.write('some')
      expect(adapter).to.have.been.calledWith('some')
      expect(anotherAdapter).to.have.been.calledWith('some')
    })

    it('should format', () => {
      reporter.write('Success: %d Failure: %d', 10, 20)

      return expect(adapter).to.have.been.calledWith('Success: 10 Failure: 20')
    })

    it('should format log messages correctly for single browser', () => {
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return expect(writeSpy).to.have.been.calledWith('LOG: Message\n')
    })

    it('should not log if lower priority than browserConsoleLogOptions "error"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'error',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'WARN')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "warn"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'warn',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "log"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'log',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'INFO')

      return writeSpy.should.have.not.been.called
    })

    it('should not log if lower priority than browserConsoleLogOptions "info"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'info',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'DEBUG')

      return writeSpy.should.have.not.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "warn"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'warn',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'ERROR')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "log"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'log',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'WARN')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "info"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'info',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return writeSpy.should.have.been.called
    })

    it('should log if higher priority than browserConsoleLogOptions "debug"', () => {
      const reporter = new BaseReporter(null, null, true, {
        level: 'debug',
        terminal: true
      }, adapter)
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog('Chrome', 'Message', 'INFO')

      return writeSpy.should.have.been.called
    })

    it('should format log messages correctly for multi browsers', () => {
      const writeSpy = sinon.spy(reporter, 'writeCommonMsg')

      reporter._browsers = ['Chrome', 'Firefox']
      reporter.onBrowserLog('Chrome', 'Message', 'LOG')

      return expect(writeSpy).to.have.been.calledWith('Chrome LOG: Message\n')
    })

    it('should log messages correctly when complete with just one browser', () => {
      const writeSpy = sinon.spy(reporter, 'write')
      const mockResults = { error: false, disconnected: false }

      reporter.onRunComplete(['Chrome'], mockResults)
      return writeSpy.should.have.been.called
    })
  })
})
