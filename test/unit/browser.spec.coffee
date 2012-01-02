#==============================================================================
# lib/browser.js module
#==============================================================================
describe 'browser', ->
  util = require('../test-util.js')
  b = require '../../lib/browser'

  beforeEach util.disableLogger

  #============================================================================
  # browser.Browser
  #============================================================================
  describe 'Browser', ->
    browser = collection = null

    beforeEach ->
      collection = new b.Collection
      browser = new b.Browser 'fake-id', collection


    it 'should have toString method', ->
      expect(browser.toString()).toBe 'fake-id'

      browser.name = 'Chrome 16.0'
      expect(browser.toString()).toBe 'Chrome 16.0'


    #==========================================================================
    # browser.Browser.onName
    #==========================================================================
    describe 'onName', ->

      it 'should set fullName and name', ->
        browser.onName 'Chrome/16.0 full name'
        expect(browser.name).toBe 'Chrome 16.0'
        expect(browser.fullName).toBe 'Chrome/16.0 full name'


    #==========================================================================
    # browser.Browser.onComplete
    #==========================================================================
    describe 'onComplete', ->

      it 'should set isReady to true', ->
        browser.isReady = false
        browser.onComplete()
        expect(browser.isReady).toBe true


      it 'should fire "change" event on parent collection', ->
        spy = jasmine.createSpy 'change'
        collection.on 'change', spy
        browser.onComplete()
        expect(spy).toHaveBeenCalled()


    #==========================================================================
    # browser.Browser.onDisconnect
    #==========================================================================
    describe 'onDisconnect', ->

      it 'should remove from parent collection', ->
        collection.add browser

        expect(collection.length).toBe 1
        browser.onDisconnect()
        expect(collection.length).toBe 0


  #============================================================================
  # browser.Collection
  #============================================================================
  describe 'Collection', ->
    collection = null

    beforeEach ->
      collection = new b.Collection

    #==========================================================================
    # browser.Collection.add
    #==========================================================================
    describe 'add', ->

      it 'should add browser', ->
        expect(collection.length).toBe 0
        collection.add new b.Browser 'id'
        expect(collection.length).toBe 1


      it 'should fire "change" event', ->
        spy = jasmine.createSpy 'change'
        collection.on 'change', spy
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


      it 'should fire "change" event', ->
        spy = jasmine.createSpy 'change'
        browser = new b.Browser 'id'
        collection.add browser

        collection.on 'change', spy
        collection.remove browser
        expect(spy).toHaveBeenCalled()


      it 'should return false if given browser does not exist within the collection', ->
        spy = jasmine.createSpy 'change'
        collection.on 'change', spy
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


      it 'should fire "change" event if at least one browser changed', ->
        spy = jasmine.createSpy 'change'
        browsers[0].isReady = false
        collection.on 'change', spy
        collection.setAllIsReadyTo true
        expect(spy).toHaveBeenCalled()


      it 'should not fire "change" event if no change', ->
        spy = jasmine.createSpy 'change'
        collection.on 'change', spy
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
