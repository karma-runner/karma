'use strict'

const EventEmitter = require('events').EventEmitter
const loadFile = require('mocks').loadFile
const path = require('path')
const _ = require('lodash')
const sinon = require('sinon')
const logger = require('../../lib/logger')

const File = require('../../lib/file')

describe('reporter', () => {
  let m

  beforeEach(() => {
    m = loadFile(path.join(__dirname, '/../../lib/reporter.js'))
  })

  describe('formatError', () => {
    let emitter
    let formatError = emitter = null
    let sandbox

    beforeEach(() => {
      emitter = new EventEmitter()
      formatError = m.createErrorFormatter({ basePath: '', hostname: 'localhost', port: 8080 }, emitter)
      sandbox = sinon.createSandbox()
    })

    it('should call config.formatError if defined', () => {
      const spy = sandbox.spy()
      formatError = m.createErrorFormatter({ basePath: '', formatError: spy }, emitter)
      formatError()

      expect(spy).to.have.been.calledOnce
    })

    it('should not call config.formatError if not defined', () => {
      const spy = sandbox.spy()
      formatError()

      expect(spy).not.to.have.been.calledOnce
    })

    it('should pass the error message as the first config.formatError argument', () => {
      const ERROR = 'foo bar'
      const spy = sandbox.spy()
      formatError = m.createErrorFormatter({ basePath: '', formatError: spy }, emitter)
      formatError(ERROR)

      expect(spy.firstCall.args[0]).to.equal(ERROR)
    })

    it('should display the exact error returned by config.formatError', () => {
      const formattedError = 'A new error'
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
        formatError({ hello: 'world' })
      ).to.equal(
        JSON.stringify({ hello: 'world' }) + '\n'
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
      const ERROR = 'file http://localhost:8080/base/usr/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9 and http://127.0.0.1:8080/absolute/home/file.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError(ERROR)).to.be.equal('file usr/file.js and http://127.0.0.1:8080/home/file.js\n')
    })

    it('should indent all lines', () => {
      expect(formatError('first\nsecond\nthird', '\t')).to.equal('\tfirst\n\tsecond\n\tthird\n')
    })

    it('should restore base paths', () => {
      formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter)
      expect(formatError('at http://localhost:123/base/a.js?123')).to.equal('at a.js\n')
    })

    it('should restore urlRoot paths', () => {
      formatError = m.createErrorFormatter({ urlRoot: '/__karma__', basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter)
      expect(formatError('at http://localhost:123/__karma__/base/sub/a.js?123')).to.equal('at sub/a.js\n')
    })

    it('should restore absolute paths', () => {
      const ERROR = 'at http://localhost:8080/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9'
      expect(formatError(ERROR)).to.equal('at /usr/path.js\n')
    })

    it('should preserve line numbers', () => {
      const ERROR = 'at http://localhost:8080/absolute/usr/path.js?6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9:2'
      expect(formatError(ERROR)).to.equal('at /usr/path.js:2\n')
    })

    it('should preserve absolute word', () => {
      const ERROR = 'contains absolute'
      expect(formatError(ERROR)).to.equal('contains absolute\n')
    })

    it('should preserve base word', () => {
      const ERROR = 'contains base'
      expect(formatError(ERROR)).to.equal('contains base\n')
    })

    describe('source maps', () => {
      let originalPositionForCallCount = 0
      let sourceMappingPath = null
      let log
      let logWarnStub

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

      class MockSourceMapConsumerWithParseError {
        constructor () {
          throw new Error('Fake parse error from source map consumer')
        }
      }

      class MockSourceMapConsumerWithGeneratedCode {
        constructor (sourceMap) {
          this.source = sourceMap.content.replace('SOURCE MAP ', sourceMappingPath)
        }

        originalPositionFor () {
          return {
            source: null,
            line: null,
            column: null
          }
        }
      }

      beforeEach(() => {
        originalPositionForCallCount = 0
        sourceMappingPath = '/original/'

        log = logger.create('reporter')
        logWarnStub = sinon.spy(log, 'warn')
      })

      afterEach(() => {
        logWarnStub.restore()
      })

      MockSourceMapConsumer.GREATEST_LOWER_BOUND = 1
      MockSourceMapConsumer.LEAST_UPPER_BOUND = 2

      it('should rewrite stack traces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      // Regression test for cases like: https://github.com/karma-runner/karma/pull/1098.
      // Note that the scenario outlined in the PR should no longer surface due to a check
      // ensuring that the line always is non-zero, but there could be other parsing errors.
      it('should handle source map errors gracefully', (done) => {
        formatError = m.createErrorFormatter({ basePath: '', hostname: 'localhost', port: 123 }, emitter,
          MockSourceMapConsumerWithParseError)

        const servedFiles = [new File('/a.js'), new File('/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at b.js:2:6\n')
          expect(logWarnStub.callCount).to.equal(2)
          expect(logWarnStub).to.have.been.calledWith('An unexpected error occurred while resolving the original position for: http://localhost:123/base/b.js:2:6')
          expect(logWarnStub).to.have.been.calledWith(sinon.match({ message: 'Fake parse error from source map consumer' }))
          done()
        })
      })

      // Generated code can be added by e.g. TypeScript or Babel when it transforms
      // native async/await to generators. Calls would then be wrapped with a helper
      // that is generated and does not map to anything, so-called generated code that
      // is allowed as case #1 in the source map spec.
      it('should not warn for trace file portion for generated code', (done) => {
        formatError = m.createErrorFormatter({ basePath: '', hostname: 'localhost', port: 123 }, emitter,
          MockSourceMapConsumerWithGeneratedCode)

        const servedFiles = [new File('/a.js'), new File('/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at b.js:2:6\n')
          expect(logWarnStub.callCount).to.equal(0)
          done()
        })
      })

      it('should rewrite stack traces (when basePath is empty)', (done) => {
        formatError = m.createErrorFormatter({ basePath: '', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/a.js'), new File('/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      it('should rewrite stack traces to the first column when no column is given', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:2'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:3 <- b.js:2\n')
          done()
        })
      })

      it('should rewrite relative url stack traces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at /base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      it('should resolve relative urls from source maps', (done) => {
        sourceMappingPath = 'original/' // Note: relative path.
        formatError = m.createErrorFormatter({ basePath: '/some/base' }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/path/a.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.fancyjs' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at /base/path/a.js:2:6'
          expect(formatError(ERROR)).to.equal('at path/original/a.fancyjs:4:8 <- path/a.js:2:6\n')
          done()
        })
      })

      it('should fall back to non-source-map format if originalPositionFor throws', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js:0:0'
          expect(formatError(ERROR)).to.equal('at b.js\n')
          done()
        })
      })

      it('should not try to use source maps when no line is given', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = 'at http://localhost:123/base/b.js'
          expect(formatError(ERROR)).to.equal('at b.js\n')
          expect(originalPositionForCallCount).to.equal(0)
          done()
        })
      })

      it('should not try to match domains with spaces', (done) => {
        formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 9876 }, emitter, MockSourceMapConsumer)
        const servedFiles = [new File('/some/base/a.js'), new File('/some/base/b.js')]
        servedFiles[0].sourceMap = { content: 'SOURCE MAP a.js' }
        servedFiles[1].sourceMap = { content: 'SOURCE MAP b.js' }

        emitter.emit('file_list_modified', { served: servedFiles })

        _.defer(() => {
          const ERROR = '"http://localhost:9876"\n at /base/b.js:2:6'
          expect(formatError(ERROR)).to.equal('"http://localhost:9876"\n at /original/b.js:4:8 <- b.js:2:6\n')
          done()
        })
      })

      describe('Windows', () => {
        formatError = null
        let servedFiles = null

        beforeEach(() => {
          formatError = m.createErrorFormatter({ basePath: '/some/base', hostname: 'localhost', port: 123 }, emitter, MockSourceMapConsumer)
          servedFiles = [new File('C:/a/b/c.js')]
          servedFiles[0].sourceMap = { content: 'SOURCE MAP b.js' }
        })

        it('should correct rewrite stack traces without sha', (done) => {
          emitter.emit('file_list_modified', { served: servedFiles })

          _.defer(() => {
            const ERROR = 'at http://localhost:123/absoluteC:/a/b/c.js:2:6'
            expect(formatError(ERROR)).to.equal('at c:/original/b.js:4:8 <- C:/a/b/c.js:2:6\n')
            done()
          })
        })

        it('should correct rewrite stack traces with sha', (done) => {
          emitter.emit('file_list_modified', { served: servedFiles })

          _.defer(() => {
            const ERROR = 'at http://localhost:123/absoluteC:/a/b/c.js?da39a3ee5e6:2:6'
            expect(formatError(ERROR)).to.equal('at c:/original/b.js:4:8 <- C:/a/b/c.js:2:6\n')
            done()
          })
        })
      })
    })
  })
})
