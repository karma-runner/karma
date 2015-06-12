Promise = require 'bluebird'
EventEmitter = require('events').EventEmitter

List = require '../../lib/file-list'
config = require '../../lib/config'

# create an array of pattern objects from given strings
patterns = (strings...) ->
  new config.Pattern(str) for str in strings

describe.only 'FileList', ->
  list = emitter = preprocess = null

  describe 'refresh', ->
    beforeEach ->
      preprocess = sinon.spy((file, done) -> process.nextTick done)
      emitter = new EventEmitter()
      list = new List(
        patterns('/some/*.js', '*.txt'),
        [],
        emitter,
        preprocess
      )

    it 'does not refresh when currently refreshing', ->
      sinon.spy(list, '_refresh')

      Promise.all([
        list.refresh()
        list.refresh()
      ])
      .then ->
        expect(list._refresh).to.have.been.calledOnce


  describe 'reload', ->

    it 'refreshes, even when a refresh is already happening', ->
      sinon.spy(list, '_refresh')

      Promise.all([
        list.refresh()
        list.reload(patterns('*.txt'), [])
      ])
      .then ->
        expect(list._refresh).to.have.been.calledTwice
