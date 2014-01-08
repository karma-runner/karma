describe 'launchers/base.js', ->
  BaseLauncher = require '../../../lib/launchers/base'
  EventEmitter = require('../../../lib/events').EventEmitter
  launcher = emitter = null

  beforeEach ->
    emitter = new EventEmitter
    launcher = new BaseLauncher 'fake-id', emitter

  it 'should manage state', ->
    launcher.start 'http://localhost:9876/'
    expect(launcher.state).to.equal launcher.STATE_BEING_CAPTURED

    launcher.markCaptured()
    expect(launcher.state).to.equal launcher.STATE_CAPTURED
    expect(launcher.isCaptured()).to.equal true


  describe 'start', ->

    it 'should fire "start" event and pass url with id', ->
      spyOnStart = sinon.spy()
      launcher.on 'start', spyOnStart
      launcher.start 'http://localhost:9876/'

      expect(spyOnStart).to.have.been.calledWith 'http://localhost:9876/?id=fake-id'


  describe 'restart', ->

    it 'should kill running browser and start with previous url', (done) ->
      spyOnStart = sinon.spy()
      spyOnKill = sinon.spy()
      launcher.on 'start', spyOnStart
      launcher.on 'kill', spyOnKill

      launcher.start 'http://host:9988/'
      spyOnStart.reset()

      launcher.restart()
      expect(spyOnKill).to.have.been.called
      expect(spyOnStart).to.not.have.been.called

      # the process (or whatever it is) actually finished
      launcher._done()
      spyOnKill.callArg 0

      process.nextTick ->
        expect(spyOnStart).to.have.been.calledWith 'http://host:9988/?id=fake-id'
        done()


    it 'should start when already finished (crashed)', (done) ->
      spyOnStart = sinon.spy()
      spyOnKill = sinon.spy()
      spyOnDone = sinon.spy()
      launcher.on 'start', spyOnStart
      launcher.on 'kill', spyOnKill

      launcher.on 'done', -> launcher.restart()
      launcher.on 'done', spyOnDone


      launcher.start 'http://host:9988/'
      spyOnStart.reset()

      # simulate crash
      # the first onDone will restart
      launcher._done 'crashed'

      process.nextTick ->
        expect(spyOnKill).to.not.have.been.called
        expect(spyOnStart).to.have.been.called
        expect(spyOnDone).to.have.been.called
        expect(spyOnDone).to.have.been.calledBefore spyOnStart
        done()


    it 'should not restart when being force killed', (done) ->
      spyOnStart = sinon.spy()
      spyOnKill = sinon.spy()
      launcher.on 'start', spyOnStart
      launcher.on 'kill', spyOnKill


      launcher.start 'http://host:9988/'
      spyOnStart.reset()

      onceKilled = launcher.forceKill()

      launcher.restart()

      # the process (or whatever it is) actually finished
      launcher._done()
      spyOnKill.callArg 0

      onceKilled.done ->
        expect(spyOnStart).to.not.have.been.called
        done()


  describe 'kill', ->

    it 'should manage state', (done) ->
      onceKilled = launcher.kill()
      expect(launcher.state).to.equal launcher.STATE_BEING_KILLED

      onceKilled.done ->
        expect(launcher.state).to.equal launcher.STATE_FINISHED
        done()


    it 'should fire "kill" and wait for all listeners to finish', (done) ->
      spyOnKill1 = sinon.spy()
      spyOnKill2 = sinon.spy()
      spyKillDone = sinon.spy done

      launcher.on 'kill', spyOnKill1
      launcher.on 'kill', spyOnKill2

      launcher.start 'http://localhost:9876/'
      launcher.kill().then spyKillDone
      expect(spyOnKill1).to.have.been.called
      expect(spyOnKill2).to.have.been.called
      expect(spyKillDone).to.not.have.been.called

      spyOnKill1.callArg 0 # the first listener is done
      expect(spyKillDone).to.not.have.been.called

      spyOnKill2.callArg 0 # the second listener is done


    it 'should not fire "kill" if already killed', (done) ->
      spyOnKill = sinon.spy()
      launcher.on 'kill', spyOnKill

      launcher.start 'http://localhost:9876/'
      launcher.kill().then ->
        spyOnKill.reset()
        launcher.kill().then ->
          expect(spyOnKill).to.not.have.been.called
          done()

      spyOnKill.callArg 0


    it 'should not fire "kill" if already being killed, but wait for all listeners', (done) ->
      spyOnKill = sinon.spy()
      launcher.on 'kill', spyOnKill

      expectOnKillListenerIsAlreadyFinishedAndHasBeenOnlyCalledOnce = ->
        expect(spyOnKill).to.have.been.called
        expect(spyOnKill.callCount).to.equal 1
        expect(spyOnKill.finished).to.equal true
        expect(launcher.state).to.equal launcher.STATE_FINISHED

      launcher.start 'http://localhost:9876/'
      firstKilling = launcher.kill().then ->
        expectOnKillListenerIsAlreadyFinishedAndHasBeenOnlyCalledOnce()

      secondKilling = launcher.kill().then ->
        expectOnKillListenerIsAlreadyFinishedAndHasBeenOnlyCalledOnce()

      expect(launcher.state).to.equal launcher.STATE_BEING_KILLED

      process.nextTick ->
        spyOnKill.finished = true
        spyOnKill.callArg 0

      # finish the test once everything is done
      firstKilling.done -> secondKilling.done -> done()


    it 'should not kill already crashed browser', (done) ->
      spyOnKill = sinon.spy((killDone) -> killDone())
      launcher.on 'kill', spyOnKill

      launcher._done 'crash'
      launcher.kill().done ->
        expect(spyOnKill).to.not.have.been.called
        done()


  describe 'forceKill', ->

    it 'should cancel restart', (done) ->
      spyOnStart = sinon.spy()
      launcher.on 'start', spyOnStart

      launcher.start 'http://localhost:9876/'
      spyOnStart.reset()
      launcher.restart()

      launcher.forceKill().done ->
        expect(launcher.state).to.equal launcher.STATE_FINISHED
        expect(spyOnStart).to.not.have.been.called
        done()


    it 'should not fire "browser_process_failure" even if browser crashes', (done) ->
      spyOnBrowserProcessFailure = sinon.spy()
      emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

      launcher.on 'kill', (killDone) ->
        process.nextTick ->
          launcher._done 'crashed'
          killDone()

      launcher.start 'http://localhost:9876/'
      launcher.forceKill().done ->
        expect(spyOnBrowserProcessFailure).to.not.have.been.called
        done()


  describe 'markCaptured', ->

    it 'should not mark capture when killing', ->
      launcher.kill()
      launcher.markCaptured()
      expect(launcher.state).to.not.equal launcher.STATE_CAPTURED


  describe '_done', ->

    it 'should emit "browser_process_failure" if there is an error', ->
      spyOnBrowserProcessFailure = sinon.spy()
      emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

      launcher._done 'crashed'
      expect(spyOnBrowserProcessFailure).to.have.been.called
      expect(spyOnBrowserProcessFailure).to.have.been.calledWith launcher


    it 'should not emit "browser_process_failure" when no error happend', ->
      spyOnBrowserProcessFailure = sinon.spy()
      emitter.on 'browser_process_failure', spyOnBrowserProcessFailure

      launcher._done()
      expect(spyOnBrowserProcessFailure).not.to.have.been.called
