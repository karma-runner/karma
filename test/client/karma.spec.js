// shim all the things
require('core-js/es5')
global.JSON = require('json3')
var sinon = require('sinon')
var assert = require('assert')

var Karma = require('../../client/karma')
var MockSocket = require('./mocks').Socket

describe('Karma', function () {
  var socket, k, windowNavigator, windowLocation, windowStub, startSpy, iframe

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

    k = new Karma(socket, iframe, windowStub, windowNavigator, windowLocation)
    startSpy = sinon.spy(k, 'start')
  })

  it('should start execution when all files loaded and pass config', function () {
    var config = {
      useIframe: true
    }

    socket.emit('execute', config)
    assert(!startSpy.called)

    k.loaded()
    assert(startSpy.calledWith(config))
  })

  it('should open a new window when useIFrame is false', function () {
    var config = {
      useIframe: false
    }

    socket.emit('execute', config)
    assert(!k.start.called)

    k.loaded()
    assert(startSpy.calledWith(config))
    assert(windowStub.calledWith('about:blank'))
  })

  it('should stop execution', function () {
    sinon.spy(k, 'complete')
    socket.emit('stop')
    assert(k.complete.called)
  })

  it('should not start execution if any error during loading files', function () {
    k.error('syntax error', '/some/file.js', 11)
    k.loaded()
    sinon.spy(k, 'start')
    assert(!startSpy.called)
  })

  it('should remove reference to start even after syntax error', function () {
    var ADAPTER_START_FN = function () {}

    k.start = ADAPTER_START_FN
    k.error('syntax error', '/some/file.js', 11)
    k.loaded()
    assert.notEqual(k.start, ADAPTER_START_FN)

    k.start = ADAPTER_START_FN
    k.loaded()
    assert.notEqual(k.start, ADAPTER_START_FN)
  })

  it('should not set up context if there was an error', function () {
    var config = {
      clearContext: true
    }

    socket.emit('execute', config)

    var mockWindow = {}

    k.error('page reload')
    k.setupContext(mockWindow)

    assert(mockWindow.__karma__ == null)
    assert(mockWindow.onbeforeunloadK == null)
    assert(mockWindow.onerror == null)
  })

  it('should setup context if there was error but clearContext config is false', function () {
    var config = {
      clearContext: false
    }

    socket.emit('execute', config)

    var mockWindow = {}

    k.error('page reload')
    k.setupContext(mockWindow)

    assert(mockWindow.__karma__ != null)
    assert(mockWindow.onbeforeunload != null)
    assert(mockWindow.onerror != null)
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
    k = new Karma(socket, {}, windowStub, windowNavigator, windowLocation)

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
        k.result({id: i})
      }

      assert(!spyResult.called)

      k.result('result', {id: 50})
      assert(spyResult.called)
      assert(spyResult.args[0][0].length === 50)
    })

    it('should buffer results when polling', function () {
      var spyResult = sinon.stub()
      socket.on('result', spyResult)

      setTransportTo('polling')

      // emit 40 results
      for (var i = 1; i <= 40; i++) {
        k.result({id: i})
      }

      k.complete()
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
      k.result()
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

      k.info({total: 321})
      k.result()
      assert.deepEqual(log, ['start', 'result'])
      assert(spyStart.calledWith({total: 321}))
    })
  })

  describe('setupContext', function () {
    it('should capture alert', function () {
      sinon.spy(k, 'log')

      var mockWindow = {
        alert: function () {
          throw new Error('Alert was not patched!')
        }
      }

      k.setupContext(mockWindow)
      mockWindow.alert('What?')
      assert(k.log.calledWith('alert', ['What?']))
    })
  })

  describe('store', function () {
    it('should be getter/setter', function () {
      k.store('a', 10)
      k.store('b', [1, 2, 3])

      assert.equal(k.store('a'), 10)
      assert.deepEqual(k.store('b'), [1, 2, 3])
    })

    it('should clone arrays to avoid memory leaks', function () {
      var array = [1, 2, 3, 4, 5]

      k.store('one.array', array)
      assert.deepEqual(k.store('one.array'), array)
      assert.deepEqual(k.store('one.array'), array)
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
        k.result({id: i})
      }

      assert(!spyResult.called)

      k.complete()
      assert(spyResult.called)
    })

    it('should navigate the client to return_url if specified', function (done) {
      windowLocation.search = '?id=567&return_url=http://return.com'
      socket = new MockSocket()
      k = new Karma(socket, {}, windowStub, windowNavigator, windowLocation)

      sinon.spy(socket, 'disconnect')

      socket.on('complete', function (data, ack) {
        ack()
      })

      k.complete()

      clock.tick(500)
      setTimeout(function () {
        assert(windowLocation.href === 'http://return.com')
        done()
      }, 5)
      clock.tick(10)
    })

    it('should patch the console if captureConsole is true', function () {
      sinon.spy(k, 'log')
      k.config.captureConsole = true

      var mockWindow = {
        console: {
          log: function () {}
        }
      }

      k.setupContext(mockWindow)
      mockWindow.console.log('What?')
      assert(k.log.calledWith('log'))
      assert(k.log.args[0][1][0] === 'What?')
    })

    it('should not patch the console if captureConsole is false', function () {
      sinon.spy(k, 'log')
      k.config.captureConsole = false

      var mockWindow = {
        console: {
          log: function () {}
        }
      }

      k.setupContext(mockWindow)
      mockWindow.console.log('hello')
      assert(!k.log.called)
    })

    it('should clear context window upon complete when clearContext config is true', function () {
      var config = {
        clearContext: true
      }

      socket.emit('execute', config)
      var CURRENT_URL = iframe.src

      k.complete()

      // clock.tick() does not work in IE 7
      setTimeout(function () {
        clock.tick(1)
        assert.notEqual(iframe.src, CURRENT_URL)
      }, 10)
    })

    it('should not clear context window upon complete when clearContext config is false', function () {
      var config = {
        clearContext: false
      }

      socket.emit('execute', config)
      var CURRENT_URL = iframe.src

      k.complete()

      clock.tick(1)

      assert.equal(iframe.src, CURRENT_URL)
    })
  })
})
