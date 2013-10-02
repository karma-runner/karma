#==============================================================================
# lib/launcher.js module
#==============================================================================
describe 'launcher', ->
  di = require 'di'
  events = require '../../lib/events'
  logger = require '../../lib/logger'
  launcher = require '../../lib/launcher'

  # mock out id generator
  lastGeneratedId = null
  launcher.Launcher.generateId = ->
    ++lastGeneratedId

  class FakeBrowser
    constructor: (@id, @name, baseBrowserDecorator) ->
      baseBrowserDecorator @
      FakeBrowser._instances.push @
      sinon.stub @, 'start', -> @state = 1 # BEING_CAPTURED
      sinon.stub @, 'kill'

  class ScriptBrowser
    constructor: (@id, @name, baseBrowserDecorator) ->
      baseBrowserDecorator @
      ScriptBrowser._instances.push @
      sinon.stub @, 'start', -> @state = 1 # BEING_CAPTURED
      sinon.stub @, 'kill'


  beforeEach ->
    lastGeneratedId = 0
    FakeBrowser._instances = []
    ScriptBrowser._instances = []


  #============================================================================
  # launcher.Launcher
  #============================================================================
  describe 'Launcher', ->
    l = emitter = null

    beforeEach ->
      emitter = new events.EventEmitter()
      injector = new di.Injector [{
        'launcher:Fake': ['type', FakeBrowser]
        'launcher:Script': ['type', ScriptBrowser]
        'emitter': ['value', emitter]
        'config': ['value', {captureTimeout: 0}]
      }]
      l = new launcher.Launcher emitter, injector

    describe 'launch', ->

      it 'should inject and start all browsers', ->
        l.launch ['Fake'], 'localhost', 1234, '/root/'

        browser = FakeBrowser._instances.pop()
        expect(browser.start).to.have.been.calledWith 'http://localhost:1234/root/'
        expect(browser.id).to.equal lastGeneratedId
        expect(browser.name).to.equal 'Fake'


      it 'should allow launching a script', ->
        l.launch ['/usr/local/bin/special-browser'], 'localhost', 1234, '/'

        script = ScriptBrowser._instances.pop()
        expect(script.start).to.have.been.calledWith 'http://localhost:1234/'
        expect(script.name).to.equal '/usr/local/bin/special-browser'


      it 'should use the non default host', ->
        l.launch ['Fake'], 'whatever', 1234, '/root/'

        browser = FakeBrowser._instances.pop()
        expect(browser.start).to.have.been.calledWith 'http://whatever:1234/root/'


    describe 'kill', ->
      it 'should kill browser with given id', ->
        killSpy = sinon.spy()

        l.launch ['Fake']
        browser = FakeBrowser._instances.pop()

        l.kill browser.id, killSpy
        expect(browser.kill).to.have.been.called

        browser.kill.invokeCallback()
        expect(killSpy).to.have.been.called


      it 'should return false if browser does not exist, but still resolve the callback', (done) ->
        l.launch ['Fake']
        browser = FakeBrowser._instances.pop()

        expect(l.kill 'weid-id', done).to.equal false
        expect(browser.kill).not.to.have.been.called

      it 'should return false if browser does not exist, and not resolve the callback if it wasn\'t defined', (done) ->
        l.launch ['Fake']
        browser = FakeBrowser._instances.pop()

        expect(l.kill 'weid-id').to.equal false
        process.nextTick ->
          done()

    describe 'killAll', ->
      exitSpy = null

      beforeEach ->
        exitSpy = sinon.spy()

      it 'should kill all running processe', ->
        l.launch ['Fake', 'Fake'], 'localhost', 1234
        l.killAll()

        browser = FakeBrowser._instances.pop()
        expect(browser.kill).to.have.been.called

        browser = FakeBrowser._instances.pop()
        expect(browser.kill).to.have.been.called


      it 'should call callback when all processes killed', ->
        l.launch ['Fake', 'Fake'], 'localhost', 1234
        l.killAll exitSpy

        expect(exitSpy).not.to.have.been.called

        # finish the first browser
        browser = FakeBrowser._instances.pop()
        browser.kill.invokeCallback()
        expect(exitSpy).not.to.have.been.called

        # finish the second browser
        browser = FakeBrowser._instances.pop()
        browser.kill.invokeCallback()
        expect(exitSpy).to.have.been.called
        # expect(browser.lastCall)


      it 'should call callback even if no browsers lanunched', (done) ->
        l.killAll done


    describe 'areAllCaptured', ->

      it 'should return true if only if all browsers captured', ->
        l.launch ['Fake', 'Fake'], 'localhost', 1234

        expect(l.areAllCaptured()).to.equal  false

        l.markCaptured 1
        expect(l.areAllCaptured()).to.equal  false

        l.markCaptured 2
        expect(l.areAllCaptured()).to.equal  true


    describe 'onExit', ->

      it 'should kill all browsers', (done) ->
        l.launch ['Fake', 'Fake'], 'localhost', 1234, '/', 0, 1

        emitter.emitAsync('exit').then done

        browser = FakeBrowser._instances.pop()
        browser.kill.invokeCallback()

        browser = FakeBrowser._instances.pop()
        browser.kill.invokeCallback()
