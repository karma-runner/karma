var BaseLauncher = require('../../../lib/launchers/base')
var CaptureTimeoutLauncher = require('../../../lib/launchers/capture_timeout')
var createMockTimer = require('../mocks/timer')

describe('launchers/capture_timeout.js', () => {
  var timer
  var launcher

  beforeEach(() => {
    timer = createMockTimer()
    launcher = new BaseLauncher('fake-id')

    sinon.spy(launcher, 'kill')
  })

  it('should kill if not captured in captureTimeout', () => {
    CaptureTimeoutLauncher.call(launcher, timer, 10)

    launcher.start()
    timer.wind(20)
    expect(launcher.kill).to.have.been.called
  })

  it('should not kill if browser got captured', () => {
    CaptureTimeoutLauncher.call(launcher, timer, 10)

    launcher.start()
    launcher.markCaptured()
    timer.wind(20)
    expect(launcher.kill).not.to.have.been.called
  })

  it('should not do anything if captureTimeout = 0', () => {
    CaptureTimeoutLauncher.call(launcher, timer, 0)

    launcher.start()
    timer.wind(20)
    expect(launcher.kill).not.to.have.been.called
  })

  it('should clear timeout between restarts', (done) => {
    CaptureTimeoutLauncher.call(launcher, timer, 10)

    // simulate process finished
    launcher.on('kill', (onKillDone) => {
      launcher._done()
      onKillDone()
    })

    launcher.start()
    timer.wind(8)
    launcher.kill().done(() => {
      launcher.kill.reset()
      launcher.start()
      timer.wind(8)
      expect(launcher.kill).not.to.have.been.called
      done()
    })
  })
})
