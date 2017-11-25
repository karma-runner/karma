var Promise = require('bluebird')
var di = require('di')

var events = require('../../lib/events')
var launcher = require('../../lib/launcher')
var createMockTimer = require('./mocks/timer')

// promise mock
var stubPromise = (obj, method, stubAction) => {
  var promise = new Promise((resolve) => {
    obj[method].resolve = resolve
  })

  sinon.stub(obj, method).callsFake(() => {
    if (stubAction) stubAction()

    return promise
  })
}

function FakeBrowser (id, name, baseBrowserDecorator) {
  this.id = id
  this.name = name
  this.DEFAULT_CMD = {
    linux: '/script',
    darwin: '/script',
    win32: 'script.exe'
  }
  this.ENV_CMD = 'SCRIPT_BIN'

  baseBrowserDecorator(this)
  FakeBrowser._instances.push(this)
  sinon.stub(this, 'start').callsFake(() => {
    this.state = this.STATE_BEING_CAPTURED
    this._done()
  })
  stubPromise(this, 'forceKill')
  sinon.stub(this, 'restart')
}

function ScriptBrowser (id, name, baseBrowserDecorator) {
  this.id = id
  this.name = name
  this.DEFAULT_CMD = {
    linux: '/script',
    darwin: '/script',
    win32: 'script.exe'
  }
  this.ENV_CMD = 'SCRIPT_BIN'

  baseBrowserDecorator(this)
  ScriptBrowser._instances.push(this)
  sinon.stub(this, 'start').callsFake(() => {
    this.state = this.STATE_BEING_CAPTURED
    this._done()
  })
  stubPromise(this, 'forceKill')
  sinon.stub(this, 'restart')
}

describe('launcher', () => {
  // mock out id generator
  var lastGeneratedId = null
  launcher.Launcher.generateId = () => {
    return ++lastGeneratedId
  }

  before(() => {
    Promise.setScheduler((fn) => fn())
  })

  after(() => {
    Promise.setScheduler((fn) => process.nextTick(fn))
  })

  beforeEach(() => {
    lastGeneratedId = 0
    FakeBrowser._instances = []
    ScriptBrowser._instances = []
  })

  describe('Launcher', () => {
    var emitter
    var server
    var config
    var l

    beforeEach(() => {
      emitter = new events.EventEmitter()
      server = {'loadErrors': []}
      config = {
        captureTimeout: 0,
        protocol: 'http:',
        hostname: 'localhost',
        port: 1234,
        urlRoot: '/root/'
      }

      var injector = new di.Injector([{
        'launcher:Fake': ['type', FakeBrowser],
        'launcher:Script': ['type', ScriptBrowser],
        'server': ['value', server],
        'emitter': ['value', emitter],
        'config': ['value', config],
        'timer': ['factory', createMockTimer]
      }])
      l = new launcher.Launcher(server, emitter, injector)
    })

    describe('launch', () => {
      it('should inject and start all browsers', (done) => {
        l.launch(['Fake'], 1)

        var browser = FakeBrowser._instances.pop()
        l.jobs.on('end', () => {
          expect(browser.start).to.have.been.calledWith('http://localhost:1234/root/')
          expect(browser.id).to.equal(lastGeneratedId)
          expect(browser.name).to.equal('Fake')
          done()
        })
      })

      describe('with upstream proxy settings', () => {
        beforeEach(() => {
          emitter = new events.EventEmitter()
          server = {'loadErrors': []}
          config = {
            captureTimeout: 0,
            protocol: 'http:',
            hostname: 'localhost',
            port: 1234,
            urlRoot: '/root/',
            upstreamProxy: {
              path: '/__proxy__/',
              hostname: 'proxy',
              port: '5678',
              protocol: 'https:'
            }
          }

          var injector = new di.Injector([{
            'launcher:Fake': ['type', FakeBrowser],
            'launcher:Script': ['type', ScriptBrowser],
            'server': ['value', server],
            'emitter': ['value', emitter],
            'config': ['value', config],
            'timer': ['factory', createMockTimer]
          }])
          l = new launcher.Launcher(server, emitter, injector)
        })

        it('should inject and start all browsers', (done) => {
          l.launch(['Fake'], 1)

          var browser = FakeBrowser._instances.pop()
          l.jobs.on('end', () => {
            expect(browser.start).to.have.been.calledWith('https://proxy:5678/__proxy__/root/')
            expect(browser.id).to.equal(lastGeneratedId)
            expect(browser.name).to.equal('Fake')
            done()
          })
        })
      })

      it('should not start when server has load errors', (done) => {
        server.loadErrors = ['error']
        l.launch(['Fake'], 1)

        l.jobs.on('end', () => {
          expect(FakeBrowser._instances).to.be.empty
          done()
        })
      })

      it('should allow launching a script', (done) => {
        l.launch(['/usr/local/bin/special-browser'], 1)

        var script = ScriptBrowser._instances.pop()

        l.jobs.on('end', () => {
          expect(script.start).to.have.been.calledWith('http://localhost:1234/root/')
          expect(script.name).to.equal('/usr/local/bin/special-browser')

          done()
        })
      })

      it('should use the non default host', (done) => {
        config.hostname = 'whatever'
        l.launch(['Fake'], 1)

        var browser = FakeBrowser._instances.pop()
        l.jobs.on('end', () => {
          expect(browser.start).to.have.been.calledWith('http://whatever:1234/root/')
          done()
        })
      })
    })

    describe('restart', () => {
      it('should restart the browser', () => {
        l.launch(['Fake'], 1)
        var browser = FakeBrowser._instances.pop()

        var returnedValue = l.restart(lastGeneratedId)
        expect(returnedValue).to.equal(true)
        expect(browser.restart).to.have.been.called
      })

      it('should return false if the browser was not launched by launcher (manual)', () => {
        l.launch([], 1)
        expect(l.restart('manual-id')).to.equal(false)
      })
    })

    describe('kill', () => {
      it('should kill browser with given id', (done) => {
        l.launch(['Fake'], 1)
        var browser = FakeBrowser._instances.pop()

        l.kill(browser.id, done)
        expect(browser.forceKill).to.have.been.called

        browser.forceKill.resolve()
      })

      it('should return false if browser does not exist, but still resolve the callback', (done) => {
        l.launch(['Fake'], 1)
        var browser = FakeBrowser._instances.pop()

        var returnedValue = l.kill('weird-id', done)
        expect(returnedValue).to.equal(false)
        expect(browser.forceKill).not.to.have.been.called
      })

      it('should not require a callback', (done) => {
        l.launch(['Fake'], 1)
        FakeBrowser._instances.pop()

        l.kill('weird-id')
        process.nextTick(done)
      })
    })

    describe('killAll', () => {
      it('should kill all running processe', () => {
        l.launch(['Fake', 'Fake'], 1)
        l.killAll()

        var browser = FakeBrowser._instances.pop()
        expect(browser.forceKill).to.have.been.called

        browser = FakeBrowser._instances.pop()
        expect(browser.forceKill).to.have.been.called
      })

      it('should call callback when all processes killed', () => {
        var exitSpy = sinon.spy()

        l.launch(['Fake', 'Fake'], 1)
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

      it('should call callback even if no browsers lanunched', (done) => {
        l.killAll(done)
      })
    })

    describe('areAllCaptured', () => {
      it('should return true if only if all browsers captured', () => {
        l._browsers = [{
          isCaptured: () => true
        }, {
          isCaptured: () => false
        }]

        expect(l.areAllCaptured()).to.be.equal(false)

        l._browsers = [{
          isCaptured: () => true
        }, {
          isCaptured: () => true
        }]

        expect(l.areAllCaptured()).to.be.equal(true)
      })
    })

    describe('onExit', () => {
      it('should kill all browsers', (done) => {
        l.launch(['Fake', 'Fake'], 1)

        emitter.emitAsync('exit').then(done)

        var browser = FakeBrowser._instances.pop()
        browser.forceKill.resolve()

        browser = FakeBrowser._instances.pop()
        browser.forceKill.resolve()
      })
    })
  })
})
