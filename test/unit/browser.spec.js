describe('Browser', () => {
  var collection
  var emitter
  var socket
  var e = require('../../lib/events')
  var Browser = require('../../lib/browser')
  var Collection = require('../../lib/browser_collection')
  var createMockTimer = require('./mocks/timer')

  var browser = collection = emitter = socket = null
  var socketId = 0

  var mkSocket = () => {
    var s = new e.EventEmitter()
    socketId = socketId + 1
    s.id = socketId
    return s
  }

  beforeEach(() => {
    socket = mkSocket()
    emitter = new e.EventEmitter()
    collection = new Collection(emitter)
  })

  it('should set fullName and name', () => {
    var fullName = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.7 ' + '(KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7'
    browser = new Browser('id', fullName, collection, emitter, socket)
    expect(browser.name).to.equal('Chrome 16.0.912 (Mac OS X 10.6.8)')
    expect(browser.fullName).to.equal(fullName)
  })

  describe('init', () => {
    it('should emit "browser_register"', () => {
      var spyRegister = sinon.spy()
      emitter.on('browser_register', spyRegister)
      browser = new Browser(12345, '', collection, emitter, socket)
      browser.init()

      expect(spyRegister).to.have.been.called
      expect(spyRegister.args[0][0]).to.equal(browser)
    })

    it('should ad itself into the collection', () => {
      browser = new Browser(12345, '', collection, emitter, socket)
      browser.init()

      expect(collection.length).to.equal(1)
      collection.forEach((browserInCollection) => {
        expect(browserInCollection).to.equal(browser)
      })
    })
  })

  describe('toString', () => {
    it('should return browser name', () => {
      var fullName = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.7 ' + '(KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7'
      browser = new Browser('id', fullName, collection, emitter, socket)
      expect(browser.toString()).to.equal('Chrome 16.0.912 (Mac OS X 10.6.8)')
    })

    it('should return verbatim user agent string for unrecognized browser', () => {
      var fullName = 'NonexistentBot/1.2.3'
      browser = new Browser('id', fullName, collection, emitter, socket)
      expect(browser.toString()).to.equal('NonexistentBot/1.2.3')
    })
  })

  describe('onKarmaError', () => {
    beforeEach(() => {
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
    })

    it('should set lastResult.error and fire "browser_error"', () => {
      var spy = sinon.spy()
      emitter.on('browser_error', spy)
      browser.state = Browser.STATE_EXECUTING

      browser.onKarmaError()
      expect(browser.lastResult.error).to.equal(true)
      expect(spy).to.have.been.called
    })

    it('should ignore if browser not executing', () => {
      var spy = sinon.spy()
      emitter.on('browser_error', spy)
      browser.state = Browser.STATE_READY

      browser.onKarmaError()
      expect(browser.lastResult.error).to.equal(false)
      expect(spy).not.to.have.been.called
    })
  })

  describe('onInfo', () => {
    beforeEach(() => {
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
    })

    it('should emit "browser_log"', () => {
      var spy = sinon.spy()
      emitter.on('browser_log', spy)

      browser.state = Browser.STATE_EXECUTING
      browser.onInfo({log: 'something', type: 'info'})
      expect(spy).to.have.been.calledWith(browser, 'something', 'info')
    })

    it('should emit "browser_info"', () => {
      var spy = sinon.spy()
      var infoData = {}
      emitter.on('browser_info', spy)

      browser.state = Browser.STATE_EXECUTING
      browser.onInfo(infoData)
      expect(spy).to.have.been.calledWith(browser, infoData)
    })

    it('should ignore if browser not executing', () => {
      var spy = sinon.spy()
      emitter.on('browser_dump', spy)

      browser.state = Browser.STATE_READY
      browser.onInfo({dump: 'something'})
      browser.onInfo({total: 20})

      expect(browser.lastResult.total).to.equal(0)
      expect(spy).not.to.have.been.called
    })
  })

  describe('onStart', () => {
    beforeEach(() => {
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
    })

    it('should set total count of specs', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onStart({total: 20})
      expect(browser.lastResult.total).to.equal(20)
    })

    it('should emit "browser_start"', () => {
      var spy = sinon.spy()
      emitter.on('browser_start', spy)

      browser.state = Browser.STATE_EXECUTING
      browser.onStart({total: 20})

      expect(spy).to.have.been.calledWith(browser, {total: 20})
    })
  })

  describe('onComplete', () => {
    beforeEach(() => {
      sinon.stub(Date, 'now')
      Date.now.returns(12345)
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
    })

    afterEach(() => {
      Date.now.restore()
    })

    it('should set isReady to true', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onComplete()
      expect(browser.isReady()).to.equal(true)
    })

    it('should fire "browsers_change" event', () => {
      var spy = sinon.spy()
      emitter.on('browsers_change', spy)

      browser.state = Browser.STATE_EXECUTING
      browser.onComplete()
      expect(spy).to.have.been.calledWith(collection)
    })

    it('should ignore if browser not executing', () => {
      var spy = sinon.spy()
      emitter.on('browsers_change', spy)
      emitter.on('browser_complete', spy)

      browser.state = Browser.STATE_READY
      browser.onComplete()
      expect(spy).not.to.have.been.called
    })

    it('should set totalTime', () => {
      Date.now.returns(12347) // the default spy return 12345

      browser.state = Browser.STATE_EXECUTING
      browser.onComplete()

      expect(browser.lastResult.totalTime).to.equal(2)
    })

    it('should error the result if zero tests executed', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onComplete()

      expect(browser.lastResult.error).to.equal(true)
    })
  })

  describe('onDisconnect', () => {
    var timer = null

    beforeEach(() => {
      timer = createMockTimer()
      browser = new Browser('fake-id', 'full name', collection, emitter, socket, timer, 10)
      browser.init()
    })

    it('should remove from parent collection', () => {
      expect(collection.length).to.equal(1)

      browser.onDisconnect('socket.io-reason', socket)
      expect(collection.length).to.equal(0)
    })

    it('should complete if browser executing', () => {
      var spy = sinon.spy()
      emitter.on('browser_complete', spy)
      browser.state = Browser.STATE_EXECUTING

      browser.onDisconnect('socket.io-reason', socket)
      timer.wind(20)

      expect(browser.lastResult.disconnected).to.equal(true)
      expect(spy).to.have.been.called
    })

    it('should not complete if browser not executing', () => {
      var spy = sinon.spy()
      emitter.on('browser_complete', spy)
      browser.state = Browser.STATE_READY

      browser.onDisconnect('socket.io-reason', socket)
      expect(spy).not.to.have.been.called
    })
  })

  describe('reconnect', () => {
    it('should cancel disconnecting', () => {
      var timer = createMockTimer()

      browser = new Browser('id', 'Chrome 19.0', collection, emitter, socket, timer, 10)
      browser.init()
      browser.state = Browser.STATE_EXECUTING

      browser.onDisconnect('socket.io-reason', socket)
      browser.reconnect(mkSocket())

      timer.wind(10)
      expect(browser.state).to.equal(Browser.STATE_EXECUTING)
    })

    it('should ignore disconnects on old sockets, but accept other messages', () => {
      // IE on polling sometimes reconnect on another socket (before disconnecting)

      browser = new Browser('id', 'Chrome 19.0', collection, emitter, socket, null, 0)
      browser.init()
      browser.state = Browser.STATE_EXECUTING

      browser.reconnect(mkSocket())

      // still accept results on the old socket
      socket.emit('result', {success: true})
      expect(browser.lastResult.success).to.equal(1)

      socket.emit('karma_error', {})
      expect(browser.lastResult.error).to.equal(true)

      // should be ignored, keep executing
      socket.emit('disconnect', 'socket.io reason')
      expect(browser.state).to.equal(Browser.STATE_EXECUTING)
    })

    it('should reconnect a disconnected browser', () => {
      browser = new Browser('id', 'Chrome 25.0', collection, emitter, socket, null, 10)
      browser.state = Browser.STATE_DISCONNECTED

      browser.reconnect(mkSocket())

      expect(browser.isReady()).to.equal(true)
    })
  })

  describe('onResult', () => {
    var createSuccessResult = () => {
      return {success: true, suite: [], log: []}
    }

    var createFailedResult = () => {
      return {success: false, suite: [], log: []}
    }

    var createSkippedResult = () => {
      return {success: true, skipped: true, suite: [], log: []}
    }

    beforeEach(() => {
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
    })

    it('should update lastResults', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onResult(createSuccessResult())
      browser.onResult(createSuccessResult())
      browser.onResult(createFailedResult())
      browser.onResult(createSkippedResult())

      expect(browser.lastResult.success).to.equal(2)
      expect(browser.lastResult.failed).to.equal(1)
      expect(browser.lastResult.skipped).to.equal(1)
    })

    it('should ignore if not running', () => {
      browser.state = Browser.STATE_READY
      browser.onResult(createSuccessResult())
      browser.onResult(createSuccessResult())
      browser.onResult(createFailedResult())

      expect(browser.lastResult.success).to.equal(0)
      expect(browser.lastResult.failed).to.equal(0)
    })

    it('should update netTime', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onResult({time: 3, suite: [], log: []})
      browser.onResult({time: 1, suite: [], log: []})
      browser.onResult({time: 5, suite: [], log: []})

      expect(browser.lastResult.netTime).to.equal(9)
    })

    it('should accept array of results', () => {
      browser.state = Browser.STATE_EXECUTING
      browser.onResult([
        createSuccessResult(), createSuccessResult(),
        createFailedResult(), createSkippedResult()
      ])

      expect(browser.lastResult.success).to.equal(2)
      expect(browser.lastResult.failed).to.equal(1)
      expect(browser.lastResult.skipped).to.equal(1)
    })
  })

  describe('serialize', () => {
    it('should return plain object with only name, id, isReady properties', () => {
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
      browser.state = Browser.STATE_READY
      browser.name = 'Browser 1.0'
      browser.id = '12345'

      expect(browser.serialize()).to.deep.equal({id: '12345', name: 'Browser 1.0', isReady: true})
    })
  })

  describe('execute', () => {
    it('should emit execute and change state to EXECUTING', () => {
      var spyExecute = sinon.spy()
      var config = {}
      browser = new Browser('fake-id', 'full name', collection, emitter, socket)
      socket.on('execute', spyExecute)
      browser.execute(config)

      expect(browser.isReady()).to.equal(false)
      expect(spyExecute).to.have.been.calledWith(config)
    })
  })

  describe('scenario:', () => {
    it('reconnecting during the run', () => {
      var timer = createMockTimer()
      browser = new Browser('fake-id', 'full name', collection, emitter, socket, timer, 10)
      browser.init()
      browser.state = Browser.STATE_EXECUTING
      socket.emit('result', {success: true, suite: [], log: []})
      socket.emit('disconnect', 'socket.io reason')
      expect(browser.isReady()).to.equal(false)

      var newSocket = mkSocket()
      browser.reconnect(newSocket)
      expect(browser.isReady()).to.equal(false)

      newSocket.emit('result', {success: false, suite: [], log: []})
      newSocket.emit('complete')
      expect(browser.isReady()).to.equal(true)
      expect(browser.lastResult.success).to.equal(1)
      expect(browser.lastResult.failed).to.equal(1)
    })

    it('disconecting during the run', () => {
      var spy = sinon.spy()
      emitter.on('browser_complete', spy)
      var timer = createMockTimer()
      browser = new Browser('fake-id', 'full name', collection, emitter, socket, timer, 10)
      browser.init()
      browser.state = Browser.STATE_EXECUTING
      socket.emit('result', {success: true, suite: [], log: []})
      socket.emit('disconnect', 'socket.io reason')

      var spyBrowserError = sinon.spy()
      emitter.on('browser_error', spyBrowserError)

      timer.wind(10)
      expect(browser.lastResult.disconnected).to.equal(true)
      expect(spy).to.have.been.calledWith(browser)
      expect(spyBrowserError).to.have.been.called
    })

    it('restarting a disconnected browser', () => {
      var timer = createMockTimer()
      browser = new Browser('fake-id', 'Chrome 31.0', collection, emitter, socket, timer, 10)
      browser.init()

      browser.execute()
      socket.emit('start', {total: 10})
      socket.emit('result', {success: true, suite: [], log: []})
      socket.emit('result', {success: false, suite: [], log: []})
      socket.emit('result', {skipped: true, suite: [], log: []})
      socket.emit('disconnect', 'socket.io reason')
      timer.wind(10) // wait-for reconnecting delay
      expect(browser.state).to.equal(Browser.STATE_DISCONNECTED)
      expect(browser.disconnectsCount).to.equal(1)

      var newSocket = mkSocket()
      emitter.on('browser_register', () => browser.execute())

      // reconnect on a new socket (which triggers re-execution)
      browser.reconnect(newSocket)
      expect(browser.state).to.equal(Browser.STATE_EXECUTING)
      newSocket.emit('start', {total: 11})
      socket.emit('result', {success: true, suite: [], log: []})

      // expected cleared last result (should not include the results from previous run)
      expect(browser.lastResult.total).to.equal(11)
      expect(browser.lastResult.success).to.equal(1)
      expect(browser.lastResult.failed).to.equal(0)
      expect(browser.lastResult.skipped).to.equal(0)
    })

    it('keeping multiple active sockets', () => {
      // If there is a new connection (socket) for an already connected browser,
      // we need to keep the old socket, in the case that the new socket will disconnect.
      browser = new Browser('fake-id', 'Chrome 31.0', collection, emitter, socket, null, 10)
      browser.init()
      browser.execute()

      // A second connection...
      var newSocket = mkSocket()
      browser.reconnect(newSocket)

      // Disconnect the second connection...
      browser.onDisconnect('socket.io-reason', newSocket)
      expect(browser.state).to.equal(Browser.STATE_EXECUTING)

      // It should still be listening on the old socket.
      socket.emit('result', {success: true, suite: [], log: []})
      expect(browser.lastResult.success).to.equal(1)
    })

    it('complete only once after reconnect on the same socket', () => {
      // If there is a new connection on the same socket,
      // we should emit complete message only once.
      browser = new Browser('fake-id', 'Chrome 31.0', collection, emitter, socket, null, 10)
      browser.onComplete = sinon.spy()
      browser.init()
      browser.execute()

      // A second connection...
      browser.reconnect(socket)

      socket.emit('result', {success: true, suite: [], log: []})
      socket.emit('complete')

      expect(browser.onComplete.callCount).to.equal(1)
    })

    it('disconnect when no message during the run', () => {
      var timer = createMockTimer()
      browser = new Browser('fake-id', 'Chrome 31.0', collection, emitter, socket, timer, 10, 20)
      browser.init()
      browser.execute()

      var spyBrowserComplete = sinon.spy()
      emitter.on('browser_complete', spyBrowserComplete)

      socket.emit('start', {total: 11})
      socket.emit('result', {success: true, suite: [], log: []})

      timer.wind(20)
      expect(browser.state).to.equal(Browser.STATE_DISCONNECTED)
      expect(browser.disconnectsCount).to.equal(1)
      expect(spyBrowserComplete).to.have.been.called
    })
  })
})
