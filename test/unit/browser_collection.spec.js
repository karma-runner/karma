'use strict'

describe('BrowserCollection', () => {
  let emitter
  const e = require('../../lib/events')
  const Collection = require('../../lib/browser_collection')
  const Browser = require('../../lib/browser')
  let collection = emitter = null

  beforeEach(() => {
    emitter = new e.EventEmitter()
    collection = new Collection(emitter)
  })

  describe('add', () => {
    it('should add browser', () => {
      expect(collection.length).to.equal(0)
      collection.add(new Browser('id'))
      expect(collection.length).to.equal(1)
    })

    it('should fire "browsers_change" event', () => {
      const spy = sinon.spy()
      emitter.on('browsers_change', spy)
      collection.add({})
      expect(spy).to.have.been.called
    })
  })

  describe('remove', () => {
    it('should remove given browser', () => {
      const browser = new Browser('id')
      collection.add(browser)

      expect(collection.length).to.equal(1)
      expect(collection.remove(browser)).to.equal(true)
      expect(collection.length).to.equal(0)
    })

    it('should fire "browsers_change" event', () => {
      const spy = sinon.spy()
      const browser = new Browser('id')
      collection.add(browser)

      emitter.on('browsers_change', spy)
      collection.remove(browser)
      expect(spy).to.have.been.called
    })

    it('should return false if given browser does not exist within the collection', () => {
      const spy = sinon.spy()
      emitter.on('browsers_change', spy)
      expect(collection.remove({})).to.equal(false)
      expect(spy).not.to.have.been.called
    })
  })

  describe('getById', () => {
    it('should find the browser by id', () => {
      const browser = new Browser(123)
      collection.add(browser)

      expect(collection.getById(123)).to.equal(browser)
    })

    it('should return null if no browser with given id', () => {
      expect(collection.getById(123)).to.equal(null)

      collection.add(new Browser(456))
      expect(collection.getById(123)).to.equal(null)
    })
  })

  describe('areAllReady', () => {
    let browsers = null

    beforeEach(() => {
      browsers = [new Browser(), new Browser(), new Browser()]
      browsers.forEach((browser) => {
        browser.state = Browser.STATE_CONNECTED
        collection.add(browser)
      })
    })

    it('should return true if all browsers are ready', () => {
      expect(collection.areAllReady()).to.equal(true)
    })

    it('should return false if at least one browser is not ready', () => {
      browsers[1].state = Browser.STATE_EXECUTING
      expect(collection.areAllReady()).to.equal(false)
    })
  })

  describe('getNonReady', () => {
    it('return all non-ready browsers', () => {
      const browsers = [new Browser(), new Browser(), new Browser()]
      browsers[0].state = Browser.STATE_EXECUTING
      browsers[1].state = Browser.STATE_EXECUTING_DISCONNECTED
      browsers[2].state = Browser.STATE_CONNECTED
      browsers.forEach((browser) => collection.add(browser))

      expect(collection.getNonReady()).to.deep.equal([browsers[0], browsers[1]])
    })
  })

  describe('serialize', () => {
    it('should return plain array with serialized browsers', () => {
      const browsers = [new Browser('1'), new Browser('2')]
      browsers[0].name = 'B 1.0'
      browsers[1].name = 'B 2.0'
      collection.add(browsers[0])
      collection.add(browsers[1])

      expect(collection.serialize()).to.deep.equal([
        { id: '1', name: 'B 1.0', isConnected: true },
        { id: '2', name: 'B 2.0', isConnected: true }
      ])
    })
  })

  describe('getResults', () => {
    it('should return sum of all browser results', () => {
      const browsers = [new Browser(), new Browser()]
      collection.add(browsers[0])
      collection.add(browsers[1])
      browsers[0].lastResult.success = 2
      browsers[0].lastResult.failed = 3
      browsers[1].lastResult.success = 4
      browsers[1].lastResult.failed = 5

      const results = collection.getResults()
      expect(results.success).to.equal(6)
      expect(results.failed).to.equal(8)
    })

    it('should compute disconnected true if any browser got disconnected', () => {
      const browsers = [new Browser(), new Browser()]
      collection.add(browsers[0])
      collection.add(browsers[1])

      let results = collection.getResults()
      expect(results.disconnected).to.equal(false)

      browsers[0].lastResult.disconnected = true
      results = collection.getResults()
      expect(results.disconnected).to.equal(true)

      browsers[1].lastResult.disconnected = true
      results = collection.getResults()
      expect(results.disconnected).to.equal(true)

      browsers[0].lastResult.disconnected = false
      results = collection.getResults()
      expect(results.disconnected).to.equal(true)
    })

    it('should compute error true if any browser had error', () => {
      const browsers = [new Browser(), new Browser()]
      collection.add(browsers[0])
      collection.add(browsers[1])

      let results = collection.getResults()
      expect(results.error).to.equal(false)

      browsers[0].lastResult.error = true
      results = collection.getResults()
      expect(results.error).to.equal(true)

      browsers[1].lastResult.error = true
      results = collection.getResults()
      expect(results.error).to.equal(true)

      browsers[0].lastResult.error = false
      results = collection.getResults()
      expect(results.error).to.equal(true)
    })

    it('should compute exitCode', () => {
      const browsers = [new Browser(), new Browser()]
      browsers.forEach((browser) => collection.add(browser))

      browsers[0].lastResult.success = 2
      let results = collection.getResults()
      expect(results.exitCode).to.equal(0)

      browsers[0].lastResult.failed = 2
      results = collection.getResults()
      expect(results.exitCode).to.equal(1)

      browsers[0].lastResult.failed = 0
      browsers[1].lastResult.error = true
      results = collection.getResults()
      expect(results.exitCode).to.equal(1)

      browsers[0].lastResult.disconnected = true
      browsers[1].lastResult.error = false
      results = collection.getResults()
      expect(results.exitCode).to.equal(1)

      browsers[0].lastResult.disconnected = false
      results = collection.getResults()
      expect(results.exitCode).to.equal(0)
    })
  })

  describe('clearResults', () => {
    it('should clear all results', () => {
      // Date.now.returns 112233
      const browsers = [new Browser(), new Browser()]
      collection.add(browsers[0])
      collection.add(browsers[1])
      browsers[0].lastResult.sucess++
      browsers[0].lastResult.error = true
      browsers[1].lastResult.failed++
      browsers[1].lastResult.skipped++
      browsers[1].lastResult.disconnected = true

      collection.clearResults()
      browsers.forEach((browser) => {
        expect(browser.lastResult.success).to.equal(0)
        expect(browser.lastResult.failed).to.equal(0)
        expect(browser.lastResult.skipped).to.equal(0)
        expect(browser.lastResult.error).to.equal(false)
        expect(browser.lastResult.disconnected).to.equal(false)
      })
    })
  })

  describe('clone', () => {
    it('should create a shallow copy of the collection', () => {
      const browsers = [new Browser(), new Browser(), new Browser()]
      browsers.forEach((browser) => collection.add(browser))

      const clone = collection.clone()
      expect(clone.length).to.equal(3)

      clone.remove(browsers[0])
      expect(clone.length).to.equal(2)
      expect(collection.length).to.equal(3)
    })
  })

  describe('map', () => {
    it('should have map()', () => {
      const browsers = [new Browser(1), new Browser(2), new Browser(3)]
      browsers.forEach((browser) => collection.add(browser))

      const mappedIds = collection.map((browser) => browser.id)

      expect(mappedIds).to.deep.equal([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('should have forEach()', () => {
      const browsers = [new Browser(0), new Browser(1), new Browser(2)]
      browsers.forEach((browser) => collection.add(browser))

      collection.forEach((browser, index) => {
        expect(browser.id).to.equal(index)
      })
    })
  })

  // ============================================================================
  // server.calculateExitCode
  // ============================================================================
  describe('calculateExitCode', () => {
    const EXIT_CODE_ERROR = 1
    const EXIT_CODE_SUCCESS = 0

    describe('no tests', () => {
      const results = {
        success: 0,
        failed: 0,
        error: true
      }
      it('shall pass if failOnEmptyTestSuite not is set', () => {
        const res = collection.calculateExitCode(results)
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
      it('shall pass if failOnEmptyTestSuite is false', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: false })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
      it('shall fail if failOnEmptyTestSuite is true', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true })
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall fail if failOnFailingTestSuite is set', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnFailingTestSuite: true })
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
    })
    describe('all test passed, no errors', () => {
      const results = {
        success: 10,
        failed: 0,
        error: false
      }
      it('shall fail if singleRunBrowserNotCaptured is true', () => {
        const res = collection.calculateExitCode(results, true)
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall pass if failOnEmptyTestSuite not is set', () => {
        const res = collection.calculateExitCode(results, false)
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
      it('shall pass if failOnEmptyTestSuite not is set', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: false })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
      it('shall pass if failOnFailingTestSuite is true', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnFailingTestSuite: true })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
      it('shall pass if failOnFailingTestSuite is false', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnFailingTestSuite: false })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
    })
    describe('all test passed, with error', () => {
      const results = {
        success: 10,
        failed: 5,
        error: false
      }
      it('shall fail if singleRunBrowserNotCaptured is true', () => {
        const res = collection.calculateExitCode(results, true)
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall fail if failOnEmptyTestSuite not is set', () => {
        const res = collection.calculateExitCode(results, false)
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall fail if failOnEmptyTestSuite not is set', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: false })
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall fail if failOnFailingTestSuite is true', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnFailingTestSuite: true })
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall pass if failOnFailingTestSuite is false', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnFailingTestSuite: false })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
    })
    describe('all test passed, with skipped tests', () => {
      const results = {
        success: 10,
        skipped: 5,
        error: false
      }
      it('shall fail if singleRunBrowserNotCaptured is true', () => {
        const res = collection.calculateExitCode(results, true)
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall fail if failOnSkippedTests is true', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnSkippedTests: true })
        expect(res).to.be.equal(EXIT_CODE_ERROR)
      })
      it('shall pass if failOnSkippedTests is false', () => {
        const res = collection.calculateExitCode(results, false, { failOnEmptyTestSuite: true, failOnSkippedTests: false })
        expect(res).to.be.equal(EXIT_CODE_SUCCESS)
      })
    })
  })
})
