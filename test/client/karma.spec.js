// shim all the things
require('core-js/es5')
global.JSON = require('json3')
var sinon = require('sinon')
var assert = require('assert')

var ClientKarma = require('../../client/karma')
var ContextKarma = require('../../context/karma')
var MockSocket = require('./mocks').Socket

describe('Karma', function () {
  var socket, k, ck, windowNavigator, windowLocation, windowStub, startSpy, iframe, clientWindow

  var setTransportTo = function (transportName) {
    socket._setTransportNameTo(transportName)
    socket.emit('connect')
  }

  beforeEach(function () {
    socket = new MockSocket()
    iframe = {}
    windowNavigator = {}
    windowLocation = {search: ''}
    windowStub = sinon.stub().returns({})

    k = new ClientKarma(socket, iframe, windowStub, windowNavigator, windowLocation)
    clientWindow = {
      karma: k
    }
    ck = new ContextKarma(ContextKarma.getDirectCallParentKarmaMethod(clientWindow))
    ck.config = {}
    startSpy = sinon.spy(ck, 'start')
  })

  it('should start execution when all files loaded and pass config', function () {
    var config = ck.config = {
      useIframe: true
    }

    socket.emit('execute', config)
    assert(!startSpy.called)

    ck.loaded()
    assert(startSpy.calledWith(config))
  })

  it('should open a new window when useIFrame is false', function () {
    var config = ck.config = {
      useIframe: false,
      runInParent: false
    }

    socket.emit('execute', config)
    assert(!ck.start.called)

    ck.loaded()
    assert(startSpy.calledWith(config))
    assert(windowStub.calledWith('context.html'))
  })

  it('should stop execution', function () {
    sinon.spy(k, 'complete')
    socket.emit('stop')
    assert(k.complete.called)
  })

  it('should not start execution if any error during loading files', function () {
    ck.error('syntax error', '/some/file.js', 11)
    ck.loaded()
    sinon.spy(ck, 'start')
    assert(!startSpy.called)
  })

  it('should remove reference to start even after syntax error', function () {
    var ADAPTER_START_FN = function () {}

    ck.start = ADAPTER_START_FN
    ck.error('syntax error', '/some/file.js', 11)
    ck.loaded()
    assert.notEqual(ck.start, ADAPTER_START_FN)

    ck.start = ADAPTER_START_FN
    ck.loaded()
    assert.notEqual(k.start, ADAPTER_START_FN)
  })

  it('should not set up context if there was an error', function () {
    var config = ck.config = {
      clearContext: true
    }

    socket.emit('execute', config)

    var mockWindow = {}

    ck.error('page reload')
    ck.setupContext(mockWindow)

    assert(mockWindow.onbeforeunload == null)
    assert(mockWindow.onerror == null)
  })

  it('should setup context if there was error but clearContext config is false', function () {
    var config = ck.config = {
      clearContext: false
    }

    socket.emit('execute', config)

    var mockWindow = {}

    ck.error('page reload')
    ck.setupContext(mockWindow)

    assert(mockWindow.onbeforeunload != null)
    assert(mockWindow.onerror != null)
  })

  it('should error out if a script attempted to reload the browser after setup', function () {
    // Perform setup
    var config = ck.config = {
      clearContext: true
    }
    socket.emit('execute', config)
    var mockWindow = {}
    ck.setupContext(mockWindow)

    // Spy on our error handler
    sinon.spy(k, 'error')

    // Emulate an unload event
    mockWindow.onbeforeunload()

    // Assert our spy was called
    assert(k.error.calledWith('Some of your tests did a full page reload!'))
  })

  it('should report navigator name', function () {
    var spyInfo = sinon.spy(function (info) {
      assert(info.name === 'Fake browser name')
    })

    windowNavigator.userAgent = 'Fake browser name'
    windowLocation.search = ''
    socket.on('register', spyInfo)
    socket.emit('connect')

    assert(spyInfo.called)
  })

  it('should report browser id', function () {
    windowLocation.search = '?id=567'
    socket = new MockSocket()
    k = new ClientKarma(socket, {}, windowStub, windowNavigator, windowLocation)

    var spyInfo = sinon.spy(function (info) {
      assert(info.id === '567')
    })

    socket.on('register', spyInfo)
    socket.emit('connect')

    assert(spyInfo.called)
  })

  describe('result', function () {
    it('should buffer results when polling', function () {
      var spyResult = sinon.stub()
      socket.on('result', spyResult)

      setTransportTo('polling')

      // emit 49 results
      for (var i = 1; i < 50; i++) {
        ck.result({id: i})
      }

      assert(!spyResult.called)

      ck.result('result', {id: 50})
      assert(spyResult.called)
      assert(spyResult.args[0][0].length === 50)
    })

    it('should buffer results when polling', function () {
      var spyResult = sinon.stub()
      socket.on('result', spyResult)

      setTransportTo('polling')

      // emit 40 results
      for (var i = 1; i <= 40; i++) {
        ck.result({id: i})
      }

      ck.complete()
      assert(spyResult.called)
      assert(spyResult.args[0][0].length === 40)
    })

    it('should emit "start" with total specs count first', function () {
      var log = []

      socket.on('result', function () {
        log.push('result')
      })

      socket.on('start', function () {
        log.push('start')
      })

      setTransportTo('websocket')

      // adapter didn't call info({total: x})
      ck.result()
      assert.deepEqual(log, ['start', 'result'])
    })

    it('should not emit "start" if already done by the adapter', function () {
      var log = []

      var spyStart = sinon.spy(function () {
        log.push('start')
      })

      var spyResult = sinon.spy(function () {
        log.push('result')
      })

      socket.on('result', spyResult)
      socket.on('start', spyStart)

      setTransportTo('websocket')

      ck.info({total: 321})
      ck.result()
      assert.deepEqual(log, ['start', 'result'])
      assert(spyStart.calledWith({total: 321}))
    })
  })

  describe('setupContext', function () {
    it('should capture alert', function () {
      sinon.spy(ck, 'log')

      var mockWindow = {
        alert: function () {
          throw new Error('Alert was not patched!')
        }
      }

      ck.setupContext(mockWindow)
      mockWindow.alert('What?')
      assert(ck.log.calledWith('alert', ['What?']))
    })

    it('should capture confirm', function () {
      sinon.spy(ck, 'log')
      var confirmCalled = false

      var mockWindow = {
        confirm: function () {
          confirmCalled = true
          return true
        }
      }

      ck.setupContext(mockWindow)
      var confirmResult = mockWindow.confirm('What?')
      assert(ck.log.calledWith('confirm', ['What?']))
      assert.equal(confirmCalled, true)
      assert.equal(confirmResult, true)
    })

    it('should capture prompt', function () {
      sinon.spy(ck, 'log')
      var promptCalled = false

      var mockWindow = {
        prompt: function () {
          promptCalled = true
          return 'user-input'
        }
      }

      ck.setupContext(mockWindow)
      var promptResult = mockWindow.prompt('What is your favorite color?', 'blue')
      assert(ck.log.calledWith('prompt', ['What is your favorite color?', 'blue']))
      assert.equal(promptCalled, true)
      assert.equal(promptResult, 'user-input')
    })
  })

  describe('complete', function () {
    var clock

    before(function () {
      clock = sinon.useFakeTimers()
    })

    after(function () {
      clock.restore()
    })

    it('should clean the result buffer before completing', function () {
      var spyResult = sinon.stub()
      socket.on('result', spyResult)

      setTransportTo('polling')

      // emit 40 results
      for (var i = 0; i < 40; i++) {
        ck.result({id: i})
      }

      assert(!spyResult.called)

      ck.complete()
      assert(spyResult.called)
    })

    it('should navigate the client to return_url if specified', function (done) {
      windowLocation.search = '?id=567&return_url=http://return.com'
      socket = new MockSocket()
      k = new ClientKarma(socket, {}, windowStub, windowNavigator, windowLocation)
      clientWindow = {karma: k}
      ck = new ContextKarma(ContextKarma.getDirectCallParentKarmaMethod(clientWindow))
      ck.config = {}

      sinon.spy(socket, 'disconnect')

      socket.on('complete', function (data, ack) {
        ack()
      })

      ck.complete()

      clock.tick(500)
      setTimeout(function () {
        assert(windowLocation.href === 'http://return.com')
        done()
      }, 5)
      clock.tick(10)
    })

    it('should patch the console if captureConsole is true', function () {
      sinon.spy(ck, 'log')
      ck.config.captureConsole = true

      var mockWindow = {
        console: {
          log: function () {}
        }
      }

      ck.setupContext(mockWindow)
      mockWindow.console.log('What?')
      assert(ck.log.calledWith('log'))
      assert(ck.log.args[0][1][0] === 'What?')
    })

    it('should not patch the console if captureConsole is false', function () {
      sinon.spy(ck, 'log')
      ck.config.captureConsole = false

      var mockWindow = {
        console: {
          log: function () {}
        }
      }

      ck.setupContext(mockWindow)
      mockWindow.console.log('hello')
      assert(!ck.log.called)
    })

    it('should clear context window upon complete when clearContext config is true', function () {
      var config = ck.config = {
        clearContext: true
      }

      socket.emit('execute', config)
      var CURRENT_URL = iframe.src

      ck.complete()

      // clock.tick() does not work in IE 7
      setTimeout(function () {
        clock.tick(1)
        assert.notEqual(iframe.src, CURRENT_URL)
      }, 10)
    })

    it('should not clear context window upon complete when clearContext config is false', function () {
      var config = ck.config = {
        clearContext: false
      }

      socket.emit('execute', config)
      var CURRENT_URL = iframe.src

      ck.complete()

      clock.tick(1)

      assert.equal(iframe.src, CURRENT_URL)
    })
  })
})
