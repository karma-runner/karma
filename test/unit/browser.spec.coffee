#==============================================================================
# lib/browser.js module
#==============================================================================
describe 'browser', ->
  util = require('../test-util.js')
  b = require '../../lib/browser'
  e = require '../../lib/events'

  beforeEach util.disableLogger


  #============================================================================
  # browser.Result
  #============================================================================
  describe 'Result', ->
    result = null

    beforeEach ->
      spyOn(Date, 'now').andReturn 123
      result = new b.Result


    it 'should compute totalTime', ->
      Date.now.andReturn 223
      result.totalTimeEnd()
      expect(result.totalTime).toBe 223 - 123


  #============================================================================
  # browser.Browser
  #============================================================================
  describe 'Browser', ->
    browser = collection = emitter = null

    beforeEach ->
      emitter = new e.EventEmitter
      collection = new b.Collection emitter

      spyOn(Date, 'now').andReturn 12345
      browser = new b.Browser 'fake-id', collection, emitter


    it 'should have toString method', ->
      expect(browser.toString()).toBe 'fake-id'

      browser.name = 'Chrome 16.0'
      expect(browser.toString()).toBe 'Chrome 16.0'


    #==========================================================================
    # browser.Browser.onRegister
    #==========================================================================
    describe 'onRegister', ->

      it 'should set fullName and name', ->
        browser.onRegister name: 'Chrome/16.0 full name'
        expect(browser.name).toBe 'Chrome 16.0'
        expect(browser.fullName).toBe 'Chrome/16.0 full name'


      it 'should set launchId', ->
        browser.onRegister id: 12345, name: 'some'
        expect(browser.launchId).toBe 12345


      it 'should emit "browser_register', ->
        spyRegister = jasmine.createSpy 'browser_register'
        spyRegister.andCallFake (b) ->
          expect(b).toBe browser

        emitter.on 'browser_register', spyRegister
        browser.onRegister name : 'some'
        expect(spyRegister).toHaveBeenCalled()


    #==========================================================================
    # browser.Browser.onError
    #==========================================================================
    describe 'onError', ->

      it 'should set lastResult.error and fire "browser_error"', ->
        spy = jasmine.createSpy 'error'
        emitter.on 'browser_error', spy
        browser.isReady = false

        browser.onError()
        expect(browser.lastResult.error).toBe true
        expect(spy).toHaveBeenCalled()


      it 'should ignore if browser not executing', ->
        spy = jasmine.createSpy 'error'
        emitter.on 'browser_error', spy
        browser.isReady = true

        browser.onError()
        expect(browser.lastResult.error).toBe false
        expect(spy).not.toHaveBeenCalled()


    #==========================================================================
    # browser.Browser.onInfo
    #==========================================================================
    describe 'onInfo', ->

      it 'should set total count of specs', ->
        browser.isReady = false
        browser.onInfo {total: 20}
        expect(browser.lastResult.total).toBe 20


      it 'should emit "browser_dump"', ->
        spy = jasmine.createSpy 'dump'
        emitter.on 'browser_dump', spy

        browser.isReady = false
        browser.onInfo {dump: 'something'}
        expect(spy).toHaveBeenCalledWith browser, 'something'


      it 'should ignore if browser not executing', ->
        spy = jasmine.createSpy 'dump'
        browser.isReady = true
        emitter.on 'browser_dump', spy

        browser.onInfo {dump: 'something'}
        browser.onInfo {total: 20}

        expect(browser.lastResult.total).toBe 0
        expect(spy).not.toHaveBeenCalled()


    #==========================================================================
    # browser.Browser.onComplete
    #==========================================================================
    describe 'onComplete', ->

      it 'should set isReady to true', ->
        browser.isReady = false
        browser.onComplete()
        expect(browser.isReady).toBe true


      it 'should fire "browsers_change" event', ->
        spy = jasmine.createSpy 'change'
        emitter.on 'browsers_change', spy

        browser.isReady = false
        browser.onComplete()
        expect(spy).toHaveBeenCalled()


      it 'should ignore if browser not executing', ->
        spy = jasmine.createSpy 'listener'
        emitter.on 'browsers_change', spy
        emitter.on 'browser_complete', spy

        browser.isReady = true
        browser.onComplete()
        expect(spy).not.toHaveBeenCalled()


      it 'should set totalTime', ->
        Date.now.andReturn 12347 # the default spy return 12345

        browser.isReady = false
        browser.onComplete()

        expect(browser.lastResult.totalTime).toBe 2


    #==========================================================================
    # browser.Browser.onDisconnect
    #==========================================================================
    describe 'onDisconnect', ->

      it 'should remove from parent collection', ->
        collection.add browser

        expect(collection.length).toBe 1
        browser.onDisconnect()
        expect(collection.length).toBe 0


      it 'should complete if browser executing', ->
        spy = jasmine.createSpy 'browser complete'
        emitter.on 'browser_complete', spy
        browser.isReady = false

        browser.onDisconnect()

        expect(browser.isReady).toBe true
        expect(browser.lastResult.disconnected).toBe true
        expect(spy).toHaveBeenCalled()


      it 'should not complete if browser not executing', ->
        spy = jasmine.createSpy 'browser complete'
        emitter.on 'browser_complete', spy
        browser.isReady = true

        browser.onDisconnect()

        expect(spy).not.toHaveBeenCalled()


    #==========================================================================
    # browser.Browser.onResult
    #==========================================================================
    describe 'onResult', ->

      createSuccessResult = ->
        {success: true, suite: [], log: []}

      createFailedResult = ->
        {success: false, suite: [], log: []}

      createSkippedResult = ->
        {success: true, skipped: true, suite: [], log: []}

      it 'should update lastResults', ->
        browser.isReady = false
        browser.onResult createSuccessResult()
        browser.onResult createSuccessResult()
        browser.onResult createFailedResult()
        browser.onResult createSkippedResult()

        expect(browser.lastResult.success).toBe 2
        expect(browser.lastResult.failed).toBe 1
        expect(browser.lastResult.skipped).toBe 1


      it 'should ignore if not running', ->
        browser.isReady = true
        browser.onResult createSuccessResult()
        browser.onResult createSuccessResult()
        browser.onResult createFailedResult()

        expect(browser.lastResult.success).toBe 0
        expect(browser.lastResult.failed).toBe 0


      it 'should update netTime', ->
        browser.isReady = false
        browser.onResult {time: 3, suite: [], log: []}
        browser.onResult {time: 1, suite: [], log: []}
        browser.onResult {time: 5, suite: [], log: []}

        expect(browser.lastResult.netTime).toBe 9


    #==========================================================================
    # browser.Browser.serialize
    #==========================================================================
    describe 'serialize', ->

      it 'should return plain object with only name, id, isReady properties', ->
        browser.isReady = true
        browser.name = 'Browser 1.0'
        browser.id = '12345'

        expect(browser.serialize()).toEqual {id: '12345', name: 'Browser 1.0', isReady: true}


  #============================================================================
  # browser.Collection
  #============================================================================
  describe 'Collection', ->
    collection = emitter = null

    beforeEach ->
      emitter = new e.EventEmitter
      collection = new b.Collection emitter

    #==========================================================================
    # browser.Collection.add
    #==========================================================================
    describe 'add', ->

      it 'should add browser', ->
        expect(collection.length).toBe 0
        collection.add new b.Browser 'id'
        expect(collection.length).toBe 1


      it 'should fire "browsers_change" event', ->
        spy = jasmine.createSpy 'change'
        emitter.on 'browsers_change', spy
        collection.add {}
        expect(spy).toHaveBeenCalled()


    #==========================================================================
    # browser.Collection.remove
    #==========================================================================
    describe 'remove', ->

      it 'should remove given browser', ->
        browser = new b.Browser 'id'
        collection.add browser

        expect(collection.length).toBe 1
        expect(collection.remove browser).toBe true
        expect(collection.length).toBe 0


      it 'should fire "browsers_change" event', ->
        spy = jasmine.createSpy 'change'
        browser = new b.Browser 'id'
        collection.add browser

        emitter.on 'browsers_change', spy
        collection.remove browser
        expect(spy).toHaveBeenCalled()


      it 'should return false if given browser does not exist within the collection', ->
        spy = jasmine.createSpy 'change'
        emitter.on 'browsers_change', spy
        expect(collection.remove {}).toBe false
        expect(spy).not.toHaveBeenCalled()


    #==========================================================================
    # browser.Collection.setAllIsReadyTo
    #==========================================================================
    describe 'setAllIsReadyTo', ->
      browsers = null

      beforeEach ->
        browsers = [new b.Browser, new b.Browser, new b.Browser]
        browsers.forEach (browser) ->
          browser.isReady = true
          collection.add browser


      it 'should set all browsers isReady to given value', ->
        collection.setAllIsReadyTo false
        browsers.forEach (browser) ->
          expect(browser.isReady).toBe false

        collection.setAllIsReadyTo true
        browsers.forEach (browser) ->
          expect(browser.isReady).toBe true


      it 'should fire "browsers_change" event if at least one browser changed', ->
        spy = jasmine.createSpy 'change'
        browsers[0].isReady = false
        emitter.on 'browsers_change', spy
        collection.setAllIsReadyTo true
        expect(spy).toHaveBeenCalled()


      it 'should not fire "browsers_change" event if no change', ->
        spy = jasmine.createSpy 'change'
        emitter.on 'browsers_change', spy
        collection.setAllIsReadyTo true
        expect(spy).not.toHaveBeenCalled()


    #==========================================================================
    # browser.Collection.areAllReady
    #==========================================================================
    describe 'areAllReady', ->
      browsers = null

      beforeEach ->
        browsers = [new b.Browser, new b.Browser, new b.Browser]
        browsers.forEach (browser) ->
          browser.isReady = true
          collection.add browser


      it 'should return true if all browsers are ready', ->
        expect(collection.areAllReady()).toBe true


      it 'should return false if at least one browser is not ready', ->
        browsers[1].isReady = false
        expect(collection.areAllReady()).toBe false


      it 'should add all non-ready browsers into given array', ->
        browsers[0].isReady = false
        browsers[1].isReady = false
        nonReady = []
        collection.areAllReady nonReady
        expect(nonReady).toEqual [browsers[0], browsers[1]]


    #==========================================================================
    # browser.Collection.serialize
    #==========================================================================
    describe 'serialize', ->

      it 'should return plain array with serialized browsers', ->
        browsers = [new b.Browser('1'), new b.Browser('2')]
        browsers[0].name = 'B 1.0'
        browsers[1].name = 'B 2.0'
        collection.add browsers[0]
        collection.add browsers[1]

        expect(collection.serialize()).toEqual [{id: '1', name: 'B 1.0', isReady: true},
                                                {id: '2', name: 'B 2.0', isReady: true}]


    #==========================================================================
    # browser.Collection.getResults
    #==========================================================================
    describe 'getResults', ->

      it 'should return sum of all browser results', ->
        browsers = [new b.Browser, new b.Browser]
        collection.add browsers[0]
        collection.add browsers[1]
        browsers[0].lastResult.success = 2
        browsers[0].lastResult.failed = 3
        browsers[1].lastResult.success = 4
        browsers[1].lastResult.failed = 5

        results = collection.getResults()
        expect(results.success).toBe 6
        expect(results.failed).toBe 8


      it 'should compute disconnected true if any browser got disconnected', ->
        browsers = [new b.Browser, new b.Browser]
        collection.add browsers[0]
        collection.add browsers[1]

        results = collection.getResults()
        expect(results.disconnected).toBe false

        browsers[0].lastResult.disconnected = true
        results = collection.getResults()
        expect(results.disconnected).toBe true

        browsers[1].lastResult.disconnected = true
        results = collection.getResults()
        expect(results.disconnected).toBe true

        browsers[0].lastResult.disconnected = false
        results = collection.getResults()
        expect(results.disconnected).toBe true


      it 'should compute error true if any browser had error', ->
        browsers = [new b.Browser, new b.Browser]
        collection.add browsers[0]
        collection.add browsers[1]

        results = collection.getResults()
        expect(results.error).toBe false

        browsers[0].lastResult.error = true
        results = collection.getResults()
        expect(results.error).toBe true

        browsers[1].lastResult.error = true
        results = collection.getResults()
        expect(results.error).toBe true

        browsers[0].lastResult.error = false
        results = collection.getResults()
        expect(results.error).toBe true


      it 'should compute exitCode', ->
        browsers = [new b.Browser, new b.Browser]
        collection.add browser for browser in browsers

        browsers[0].lastResult.success = 2
        results = collection.getResults()
        expect(results.exitCode).toBe 0

        browsers[0].lastResult.failed = 2
        results = collection.getResults()
        expect(results.exitCode).toBe 1

        browsers[0].lastResult.failed = 0
        browsers[1].lastResult.error = true
        results = collection.getResults()
        expect(results.exitCode).toBe 1

        browsers[0].lastResult.disconnected = true
        browsers[1].lastResult.error = false
        results = collection.getResults()
        expect(results.exitCode).toBe 1

        browsers[0].lastResult.disconnected = false
        results = collection.getResults()
        expect(results.exitCode).toBe 0


    #==========================================================================
    # browser.Collection.clearResults
    #==========================================================================
    describe 'clearResults', ->

      it 'should clear all results', ->
        spyOn(Date, 'now').andReturn 112233
        browsers = [new b.Browser, new b.Browser]
        collection.add browsers[0]
        collection.add browsers[1]
        browsers[0].lastResult.sucess++
        browsers[0].lastResult.error = true
        browsers[1].lastResult.failed++
        browsers[1].lastResult.skipped++
        browsers[1].lastResult.disconnected = true

        collection.clearResults()
        browsers.forEach (browser) ->
          expect(browser.lastResult.success).toBe 0
          expect(browser.lastResult.failed).toBe 0
          expect(browser.lastResult.skipped).toBe 0
          expect(browser.lastResult.error).toBe false
          expect(browser.lastResult.disconnected).toBe false


    #==========================================================================
    # browser.Collection.clone
    #==========================================================================
    describe 'clone', ->

      it 'should create a shallow copy of the collection', ->
        browsers = [new b.Browser, new b.Browser, new b.Browser]
        collection.add browser for browser in browsers

        clone = collection.clone()
        expect(clone.length).toBe 3

        clone.remove browsers[0]
        expect(clone.length).toBe 2
        expect(collection.length).toBe 3


    #==========================================================================
    # browser.Collection.map
    #==========================================================================
    describe 'map', ->

      it 'should have map()', ->
        browsers = [new b.Browser(1), new b.Browser(2), new b.Browser(3)]
        collection.add browser for browser in browsers

        mappedIds = collection.map (browser) ->
          browser.id

        expect(mappedIds).toEqual [1, 2, 3]


    #==========================================================================
    # browser.Collection.forEach
    #==========================================================================
    describe 'forEach', ->

      it 'should have forEach()', ->
        browsers = [new b.Browser(0), new b.Browser(1), new b.Browser(2)]
        collection.add browser for browser in browsers

        collection.forEach (browser, index) ->
          expect(browser.id).toBe index

