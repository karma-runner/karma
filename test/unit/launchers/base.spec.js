const _ = require('lodash')

const BaseLauncher = require('../../../lib/launchers/base')
const EventEmitter = require('../../../lib/events').EventEmitter

describe('launchers/base.js', () => {
  let emitter
  let launcher

  beforeEach(() => {
    emitter = new EventEmitter()
    launcher = new BaseLauncher('fake-id', emitter)
  })

  it('should manage state', () => {
    launcher.start('http://localhost:9876/')
    expect(launcher.state).to.equal(launcher.STATE_BEING_CAPTURED)

    launcher.markCaptured()
    expect(launcher.state).to.equal(launcher.STATE_CAPTURED)
    expect(launcher.isCaptured()).to.equal(true)
  })

  describe('start', () => {
    it('should fire "start" event and pass url with id', () => {
      const spyOnStart = sinon.spy()
      launcher.on('start', spyOnStart)
      launcher.start('http://localhost:9876/')

      expect(spyOnStart).to.have.been.calledWith('http://localhost:9876/?id=fake-id')
    })
  })

  describe('restart', () => {
    it('should kill running browser and start with previous url', (done) => {
      const spyOnStart = sinon.spy()
      const spyOnKill = sinon.spy()
      launcher.on('start', spyOnStart)
      launcher.on('kill', spyOnKill)

      launcher.start('http://host:9988/')
      spyOnStart.resetHistory()

      launcher.restart()
      expect(spyOnKill).to.have.been.called
      expect(spyOnStart).to.not.have.been.called

      // the process (or whatever it is) actually finished
      launcher._done()
      spyOnKill.callArg(0)

      _.defer(() => {
        expect(spyOnStart).to.have.been.calledWith('http://host:9988/?id=fake-id')
        done()
      })
    })

    it('should start when already finished (crashed)', (done) => {
      const spyOnStart = sinon.spy()
      const spyOnKill = sinon.spy()
      const spyOnDone = sinon.spy()
      launcher.on('start', spyOnStart)
      launcher.on('kill', spyOnKill)

      launcher.on('done', () => launcher.restart())
      launcher.on('done', spyOnDone)

      launcher.start('http://host:9988/')
      spyOnStart.resetHistory()

      // simulate crash
      // the first onDone will restart
      launcher._done('crashed')

      _.defer(() => {
        expect(spyOnKill).to.not.have.been.called
        expect(spyOnStart).to.have.been.called
        expect(spyOnDone).to.have.been.called
        expect(spyOnDone).to.have.been.calledBefore(spyOnStart)
        done()
      })
    })

    it('should not restart when being force killed', async () => {
      const spyOnStart = sinon.spy()
      const spyOnKill = sinon.spy()
      launcher.on('start', spyOnStart)
      launcher.on('kill', spyOnKill)

      launcher.start('http://host:9988/')
      spyOnStart.resetHistory()

      const onceKilled = launcher.forceKill()

      launcher.restart()

      // the process (or whatever it is) actually finished
      launcher._done()
      spyOnKill.callArg(0)

      await onceKilled
      expect(spyOnStart).to.not.have.been.called
    })
  })

  describe('kill', () => {
    it('should manage state', async () => {
      const onceKilled = launcher.kill()
      expect(launcher.state).to.equal(launcher.STATE_BEING_KILLED)

      await onceKilled
      expect(launcher.state).to.equal(launcher.STATE_FINISHED)
    })

    it('should fire "kill" and wait for all listeners to finish', (done) => {
      const spyOnKill1 = sinon.spy()
      const spyOnKill2 = sinon.spy()
      const spyKillDone = sinon.spy(done)

      launcher.on('kill', spyOnKill1)
      launcher.on('kill', spyOnKill2)

      launcher.start('http://localhost:9876/')
      launcher.kill().then(spyKillDone)
      expect(spyOnKill1).to.have.been.called
      expect(spyOnKill2).to.have.been.called
      expect(spyKillDone).to.not.have.been.called

      spyOnKill1.callArg(0) // the first listener is done
      expect(spyKillDone).to.not.have.been.called

      spyOnKill2.callArg(0)
    }) // the second listener is done

    it('should not fire "kill" if already killed', (done) => {
      const spyOnKill = sinon.spy()
      launcher.on('kill', spyOnKill)

      launcher.start('http://localhost:9876/')
      launcher.kill().then(() => {
        spyOnKill.resetHistory()
        launcher.kill().then(() => {
          expect(spyOnKill).to.not.have.been.called
          done()
        })
      })

      spyOnKill.callArg(0)
    })

    it('should not fire "kill" second time if already being killed', async () => {
      const spyOnKill = sinon.spy()
      launcher.on('kill', spyOnKill)

      launcher.start('http://localhost:9876/')
      launcher.kill()
      const killing = launcher.kill()

      expect(launcher.state).to.equal(launcher.STATE_BEING_KILLED)

      spyOnKill.callArg(0)

      await killing

      expect(spyOnKill).to.have.been.called
      expect(spyOnKill.callCount).to.equal(1)
      expect(launcher.state).to.equal(launcher.STATE_FINISHED)
    })

    it('should not kill already crashed browser', async () => {
      const spyOnKill = sinon.spy((killDone) => killDone())
      launcher.on('kill', spyOnKill)

      launcher._done('crash')
      await launcher.kill()
      expect(spyOnKill).to.not.have.been.called
    })
  })

  describe('forceKill', () => {
    it('should cancel restart', async () => {
      const spyOnStart = sinon.spy()
      launcher.on('start', spyOnStart)

      launcher.start('http://localhost:9876/')
      spyOnStart.resetHistory()
      launcher.restart()

      await launcher.forceKill()

      expect(launcher.state).to.equal(launcher.STATE_FINISHED)
      expect(spyOnStart).to.not.have.been.called
    })

    it('should not fire "browser_process_failure" even if browser crashes', async () => {
      const spyOnBrowserProcessFailure = sinon.spy()
      emitter.on('browser_process_failure', spyOnBrowserProcessFailure)

      launcher.on('kill', (killDone) => {
        _.defer(() => {
          launcher._done('crashed')
          killDone()
        })
      })

      launcher.start('http://localhost:9876/')
      await launcher.forceKill()

      expect(spyOnBrowserProcessFailure).to.not.have.been.called
    })
  })

  describe('markCaptured', () => {
    it('should not mark capture when killing', () => {
      launcher.kill()
      launcher.markCaptured()
      expect(launcher.state).to.not.equal(launcher.STATE_CAPTURED)
    })
  })

  describe('_done', () => {
    it('should emit "browser_process_failure" if there is an error', () => {
      const spyOnBrowserProcessFailure = sinon.spy()
      emitter.on('browser_process_failure', spyOnBrowserProcessFailure)

      launcher._done('crashed')
      expect(spyOnBrowserProcessFailure).to.have.been.called
      expect(spyOnBrowserProcessFailure).to.have.been.calledWith(launcher)
    })

    it('should not emit "browser_process_failure" when no error happend', () => {
      const spyOnBrowserProcessFailure = sinon.spy()
      emitter.on('browser_process_failure', spyOnBrowserProcessFailure)

      launcher._done()
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
    })
  })
})
