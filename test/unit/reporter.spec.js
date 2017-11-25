'use strict'

var EventEmitter = require('events').EventEmitter
var loadFile = require('mocks').loadFile
var path = require('path')
var _ = require('lodash')
var sinon = require('sinon')

var File = require('../../lib/file')

describe('reporter', () => {
  var m

  beforeEach(() => {
    m = loadFile(path.join(__dirname, '/../../lib/reporter.js'))
  })

  describe('formatError', () => {
    var emitter
    var formatError = emitter = null
    var sandbox

    beforeEach(() => {
      emitter = new EventEmitter()
      formatError = m.createErrorFormatter({ basePath: '', hostname: 'localhost', port: 8080 }, emitter)
      sandbox = sinon.sandbox.create()
    })

    it('should call config.formatError if defined', () => {
      var spy = sandbox.spy()
      formatError = m.createErrorFormatter({ basePath: '', formatError: spy }, emitter)
      formatError()

      expect(spy).to.have.been.calledOnce
    })

    it('should not call config.formatError if not defined', () => {
      var spy = sandbox.spy()
      formatError()

      expect(spy).not.to.have.been.calledOnce
    })

    it('should pass the error message as the first config.formatError argument', () => {
      var ERROR = 'foo bar'
      var spy = sandbox.spy()
      formatError = m.createErrorFormatter({ basePath: '', formatError: spy }, emitter)
      formatError(ERROR)

      expect(spy.firstCall.args[0]).to.equal(ERROR)
    })

    it('should display the exact error returned by config.formatError', () => {
      var formattedError = 'A new error'
      formatError = m.createErrorFormatter({ basePath: '', formatError: () => formattedError }, emitter)

      expect(formatError('Something', '\t')).to.equal(formattedError)
    })

    it('should indent', () => {
      expect(formatError('Something', '\t')).to.equal('\tSomething\n')
    })

    it('should handle empty message', () => {
      expect(formatError(null)).to.equal('\n')
    })

    it('should handle arbitrary error objects', () => {
      expect(
        formatError({hello: 'world'})
      ).to.equal(
        JSON.stringify({hello: 'world'}) + '\n'
      )
    })

    it('should handle error objects', () => {
      expect(
        formatError(new Error('fail'))
      ).to.equal(
        'fail\n'
      )
    })

    it('should remove specified hostname from files', () => {
      expect(formatError('file http://localhost:8080/base/usr/a.js and http://127.0.0.1:8080/absolute/home/b.js')).to.be.equal('file usr/a.js and http://127.0.0.1:8080/home/b.js\n')
    })

    it('should remove shas', () => {
      var ERROR = 'file http://localhost:8080/base/usr/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9 and http://127.0.0.1:8080/absolute/home/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError(ERROR)).to.be.equal('file usr/file.js and http://127.0.0.1:8080/home/file.js\n')
    })

    it('should indent all lines', () => {
      expect(formatError('first\nsecond\nthird', '\t')).to.equal('\tfirst\n\tsecond\n\tthird\n')
    })

    it('should restore base paths', () => {
      formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter)
      expect(formatError('at http://localhost:123/base/a.js?123')).to.equal('at a.js\n')
    })

    it('should restore absolute paths', () => {
      var ERROR = 'at http://localhost:8080/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError(ERROR)).to.equal('at /usr/path.js\n')
    })

    it('should preserve line numbers', () => {
      var ERROR = 'at http://localhost:8080/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9:2'
      expect(formatError(ERROR)).to.equal('at /usr/path.js:2\n')
    })

    it('should preserve absolute word', () => {
      var ERROR = 'contains absolute'
      expect(formatError(ERROR)).to.equal('contains absolute\n')
    })

    it('should preserve base word', () => {
      var ERROR = 'contains base'
      expect(formatError(ERROR)).to.equal('contains base\n')
    })

    describe('source maps', () => {
      var originalPositionForCallCount = 0
      var sourceMappingPath = null

      class MockSourceMapConsumer {
        constructor (sourceMap) {
          this.source = sourceMap.content.replace('SOURCE MAP ', sourceMappingPath)
        }

        originalPositionFor (position) {
          originalPositionForCallCount++
          if (position.line === 0) {
            throw new TypeError('Line must be greater than or equal to 1, got 0')
          }

          return {
            source: this.source,
            line: position.line + 2,
            column: position.column + 2
          }
        }
      }

      beforeEach(() => {
        originalPositionForCallCount = 0
        sourceMappingPath = '/original/'
      })

      MockSourceMapConsumer.GREATEST_LOWER_BOUND = 1
      MockSourceMapConsumer.LEAST_UPPER_BOUND = 2

      it('should rewrite stack traces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      it('should rewrite stack traces to the first column when no column is given', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at http://localhost:123/base/b.js:2'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:2 <- b.js:2\n')
          done()
        })
      })

      it('should rewrite relative url stack traces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at /base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      it('should resolve relative urls from source maps', (done) => {
        sourceMappingPath = 'original/' // Note: relative path.
        formatError = m.createErrorFormatter({ basePath: '/some/base' }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/path/a.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.fancyjs'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at /base/path/a.js:2:6'
          expect(formatError(ERROR)).to.equal('at path/original/a.fancyjs:4:8 <- path/a.js:2:6\n')
          done()
        })
      })

      it('should fall back to non-source-map format if originalPositionFor throws', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at http://localhost:123/base/b.js:0:0'
          expect(formatError(ERROR)).to.equal('at b.js\n')
          done()
        })
      })

      it('should not try to use source maps when no line is given', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = 'at http://localhost:123/base/b.js'
          expect(formatError(ERROR)).to.equal('at b.js\n')
          expect(originalPositionForCallCount).to.equal(0)
          done()
        })
      })

      it('should not try to match domains with spaces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 9876 }, emitter, MockSourceMapConsumer)
        var servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = {content: 'SOURCE MAP a.js'}
        servedFiles[1].sourceMap = {content: 'SOURCE MAP b.js'}

        emitter.emit('file_list_modified', {served: servedFiles})

        _.defer(() => {
          var ERROR = '"http://localhost:9876"\n at /base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('"http://localhost:9876"\n at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      describe('Windows', () => {
        formatError = null
        var servedFiles = null

        beforeEach(() => {
          formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
          servedFiles = [new File('C:/a/b/c.js')]
          servedFiles[0].sourceMap = {content: 'SOURCE MAP b.js'}
        })

        it('should correct rewrite stack traces without sha', (done) => {
          emitter.emit('file_list_modified', {served: servedFiles})

          _.defer(() => {
            var ERROR = 'at http://localhost:123/absoluteC:/a/b/c.js:2:6'
            expect(formatError(ERROR)).to.equal('at c:/original/b.js:4:8 <- C:/a/b/c.js:2:6\n')
            done()
          })
        })

        it('should correct rewrite stack traces with sha', (done) => {
          emitter.emit('file_list_modified', {served: servedFiles})

          _.defer(() => {
            var ERROR = 'at http://localhost:123/absoluteC:/a/b/c.js?da39a3ee5e6:2:6'
            expect(formatError(ERROR)).to.equal('at c:/original/b.js:4:8 <- C:/a/b/c.js:2:6\n')
            done()
          })
        })
      })
    })
  })
})
