describe 'launchers/retry.js', ->
  BaseLauncher = require '../../../lib/launchers/base'
  RetryLauncher = require '../../../lib/launchers/retry'
  EventEmitter = require('../../../lib/events').EventEmitter
  createMockTimer = require '../mocks/timer'
  launcher = timer = emitter = null

  beforeEach ->
    timer = createMockTimer()
    emitter = new EventEmitter
    launcher = new BaseLauncher 'fake-id', emitter


  it 'should restart if browser crashed', (done) ->
    RetryLauncher.call launcher, 2

    launcher.start 'http://localhost:9876'

    sinon.spy launcher, 'start'
    spyOnBrowserProcessFailure = sinon.spy()
    emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

    # simulate crash
    launcher._done 'crash'

    scheduleNextTick ->
      expect(launcher.start).to.have.been.called
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
      done()


  it 'should eventually fail with "browser_process_failure"', (done) ->
    RetryLauncher.call launcher, 2

    launcher.start 'http://localhost:9876'

    sinon.spy launcher, 'start'
    spyOnBrowserProcessFailure = sinon.spy()
    emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

    # simulate first crash
    launcher._done 'crash'

    scheduleNextTick ->
      expect(launcher.start).to.have.been.called
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
      launcher.start.reset()

      # simulate second crash
      launcher._done 'crash'

    scheduleNextTick ->
      expect(launcher.start).to.have.been.called
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
      launcher.start.reset()

      # simulate third crash
      launcher._done 'crash'

    scheduleNextTick ->
      expect(launcher.start).not.to.have.been.called
      expect(spyOnBrowserProcessFailure).to.have.been.called
      done()


  it 'should not restart if killed normally', (done) ->
    RetryLauncher.call launcher, 2

    launcher.start 'http://localhost:9876'

    sinon.spy launcher, 'start'
    spyOnBrowserProcessFailure = sinon.spy()
    emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

    # process just exited normally
    launcher._done()

    scheduleNextTick ->
      expect(launcher.start).not.to.have.been.called
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
      expect(launcher.state).to.equal launcher.STATE_FINISHED
      done()
