import Promise from 'bluebird'
import di from 'di'
import events from '../../lib/events'
import launcher from '../../lib/launcher'
import createMockTimer from './mocks/timer'

// promise mock
var stubPromise = (obj, method, stubAction) => {
  var promise = new Promise(resolve => {
    obj[method].resolve = resolve
  })

  sinon.stub(obj, method, () => {
    if (stubAction) stubAction()

    return promise
  })
}

class FakeBrowser {
  constructor (id, name, baseBrowserDecorator) {
    this.id = id
    this.name = name
    baseBrowserDecorator(this)
    FakeBrowser._instances.push(this)
    sinon.stub(this, 'start', () => {
      this.state = this.STATE_BEING_CAPTURED
      return this.state
    })
    stubPromise(this, 'forceKill')
    sinon.stub(this, 'restart')
  }
}

class ScriptBrowser {
  constructor (id, name, baseBrowserDecorator) {
    this.id = id
    this.name = name
    baseBrowserDecorator(this)
    ScriptBrowser._instances.push(this)
    sinon.stub(this, 'start', () => {
      this.state = this.STATE_BEING_CAPTURED
    })
    stubPromise(this, 'forceKill')
    sinon.stub(this, 'restart')
  }
}

describe('launcher', () => {
  // mock out id generator
  var lastGeneratedId = null
  launcher.Launcher.generateId = () => {
    return ++lastGeneratedId
  }

  beforeEach(() => {
    lastGeneratedId = 0
    FakeBrowser._instances = []
    ScriptBrowser._instances = []
  })

  // ============================================================================
  // launcher.Launcher
  // ============================================================================
  describe('Launcher', () => {
    var emitter
    var l = emitter = null

    beforeEach(() => {
      emitter = new events.EventEmitter()
      var injector = new di.Injector([{
        'launcher:Fake': ['type', FakeBrowser],
        'launcher:Script': ['type', ScriptBrowser],
        'emitter': ['value', emitter],
        'config': ['value', {captureTimeout: 0}],
        'timer': ['factory', createMockTimer]
      }])
      l = new launcher.Launcher(emitter, injector)
    })

    describe('launch', () => {
      it('should inject and start all browsers', () => {
        l.launch(['Fake'], 'localhost', 1234, '/root/')

        var browser = FakeBrowser._instances.pop()
        expect(browser.start).to.have.been.calledWith('http://localhost:1234/root/')
        expect(browser.id).to.equal(lastGeneratedId)
        expect(browser.name).to.equal('Fake')
      })

      it('should allow launching a script', () => {
        l.launch(['/usr/local/bin/special-browser'], 'localhost', 1234, '/')

        var script = ScriptBrowser._instances.pop()
        expect(script.start).to.have.been.calledWith('http://localhost:1234/')
        expect(script.name).to.equal('/usr/local/bin/special-browser')
      })

      it('should use the non default host', () => {
        l.launch(['Fake'], 'whatever', 1234, '/root/')

        var browser = FakeBrowser._instances.pop()
        expect(browser.start).to.have.been.calledWith('http://whatever:1234/root/')
      })
    })

    describe('restart', () => {
      it('should restart the browser', () => {
        l.launch(['Fake'], 'localhost', 1234, '/root/')
        var browser = FakeBrowser._instances.pop()

        var returnedValue = l.restart(lastGeneratedId)
        expect(returnedValue).to.equal(true)
        expect(browser.restart).to.have.been.called
      })

      it('should return false if the browser was not launched by launcher (manual)', () => {
        l.launch([], 'localhost', 1234, '/')
        expect(l.restart('manual-id')).to.equal(false)
      })
    })

    describe('kill', () => {
      it('should kill browser with given id', done => {
        l.launch(['Fake'])
        var browser = FakeBrowser._instances.pop()

        l.kill(browser.id, done)
        expect(browser.forceKill).to.have.been.called

        browser.forceKill.resolve()
      })

      it('should return false if browser does not exist, but still resolve the callback', done => {
        l.launch(['Fake'])
        var browser = FakeBrowser._instances.pop()

        var returnedValue = l.kill('weird-id', done)
        expect(returnedValue).to.equal(false)
        expect(browser.forceKill).not.to.have.been.called
      })

      it('should not require a callback', done => {
        l.launch(['Fake'])
        FakeBrowser._instances.pop()

        l.kill('weird-id')
        process.nextTick(done)
      })
    })

    describe('killAll', () => {
      it('should kill all running processe', () => {
        l.launch(['Fake', 'Fake'], 'localhost', 1234)
        l.killAll()

        var browser = FakeBrowser._instances.pop()
        expect(browser.forceKill).to.have.been.called

        browser = FakeBrowser._instances.pop()
        expect(browser.forceKill).to.have.been.called
      })

      it('should call callback when all processes killed', () => {
        var exitSpy = sinon.spy()

        l.launch(['Fake', 'Fake'], 'localhost', 1234)
        l.killAll(exitSpy)

        expect(exitSpy).not.to.have.been.called

        // finish the first browser
        var browser = FakeBrowser._instances.pop()
        browser.forceKill.resolve()

        scheduleNextTick(() => {
          expect(exitSpy).not.to.have.been.called
        })

        scheduleNextTick(() => {
          // finish the second browser
          browser = FakeBrowser._instances.pop()
          browser.forceKill.resolve()
        })

        scheduleNextTick(() => {
          expect(exitSpy).to.have.been.called
        })
      })

      it('should call callback even if no browsers lanunched', done => {
        l.killAll(done)
      })
    })

    describe('areAllCaptured', () => {
      it('should return true if only if all browsers captured', () => {
        l.launch(['Fake', 'Fake'], 'localhost', 1234)

        expect(l.areAllCaptured()).to.equal(false)

        l.markCaptured(1)
        expect(l.areAllCaptured()).to.equal(false)

        l.markCaptured(2)
        expect(l.areAllCaptured()).to.equal(true)
      })
    })

    describe('onExit', () => {
      it('should kill all browsers', done => {
        l.launch(['Fake', 'Fake'], 'localhost', 1234, '/', 0, 1)

        emitter.emitAsync('exit').then(done)

        var browser = FakeBrowser._instances.pop()
        browser.forceKill.resolve()

        browser = FakeBrowser._instances.pop()
        browser.forceKill.resolve()
      })
    })
  })
})
