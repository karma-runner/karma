#==============================================================================
# lib/reporter.js module
#==============================================================================
describe 'reporter', ->
  EventEmitter = require('events').EventEmitter
  File = require('../../lib/file_list').File
  loadFile = require('mocks').loadFile
  q = require 'q'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/reporter.js'


  #==============================================================================
  # formatError() [PRIVATE]
  #==============================================================================
  describe 'formatError', ->
    formatError = emitter = null

    beforeEach ->
      emitter = new EventEmitter
      formatError = m.createErrorFormatter '', emitter


    it 'should indent', ->
      expect(formatError 'Something', '\t').to.equal '\tSomething\n'


    it 'should handle empty message', ->
      expect(formatError null).to.equal '\n'


    it 'should remove domain from files', ->
      expect(formatError 'file http://localhost:8080/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/base/home/b.js').
          to.be.equal 'file /usr/a.js and /home/b.js\n'


    # TODO(vojta): enable once we serve source under urlRoot
    it.skip 'should handle non default karma service folders', ->
      formatError = m.createErrorFormatter '', '/_karma_/'
      expect(formatError 'file http://localhost:8080/_karma_/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/_karma_/base/home/b.js').
          to.be.equal 'file /usr/a.js and /home/b.js\n'


    it 'should remove shas', ->
      ERROR = 'file ' +
              'http://localhost:8080/base/usr/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9 ' +
              'and ' +
              'http://127.0.0.1:8080/absolute/home/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError ERROR).to.be.equal 'file /usr/file.js and /home/file.js\n'


    it 'should indent all lines', ->
      expect(formatError 'first\nsecond\nthird', '\t').to.equal '\tfirst\n\tsecond\n\tthird\n'


    it 'should restore base paths', ->
      formatError = m.createErrorFormatter '/some/base', emitter
      expect(formatError 'at http://localhost:123/base/a.js?123').to.equal 'at /some/base/a.js\n'


    it 'should restore absolute paths', ->
      ERROR = 'at http://local:1233/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError ERROR).to.equal 'at /usr/path.js\n'


    it 'should preserve line numbers', ->
      ERROR = 'at http://local:1233/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9:2'
      expect(formatError ERROR).to.equal 'at /usr/path.js:2\n'


    describe 'source maps', ->

      class MockSourceMapConsumer
        constructor: (sourceMap) ->
          @source = sourceMap.replace 'SOURCE MAP ', '/original/'
        originalPositionFor: (position) ->
          source: @source
          line: position.line + 2
          column: position.column + 2

      it 'should rewrite stack traces', (done) ->
        formatError = m.createErrorFormatter '/some/base', emitter, MockSourceMapConsumer
        servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = 'SOURCE MAP a.js'
        servedFiles[1].sourceMap = 'SOURCE MAP b.js'

        emitter.emit 'file_list_modified', q(served: servedFiles)

        scheduleNextTick ->
          ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError ERROR).to.equal 'at /some/base/b.js:2:6 <- /original/b.js:4:8\n'
          done()
