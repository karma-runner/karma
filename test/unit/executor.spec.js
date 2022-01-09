'use strict'

const Browser = require('../../lib/browser')
const BrowserCollection = require('../../lib/browser_collection')
const EventEmitter = require('../../lib/events').EventEmitter
const Executor = require('../../lib/executor')

const log = require('../../lib/logger').create()

describe('executor', () => {
  let emitter
  let capturedBrowsers
  let config
  let spy
  let executor

  beforeEach(() => {
    config = { client: {} }
    emitter = new EventEmitter()
    capturedBrowsers = new BrowserCollection(emitter)
    capturedBrowsers.add(new Browser())
    executor = new Executor(capturedBrowsers, config, emitter)
    executor.socketIoSockets = new EventEmitter()

    spy = {
      onRunStart: sinon.stub(),
      onSocketsExecute: sinon.stub(),
      onRunComplete: sinon.stub()
    }
    sinon.stub(log, 'warn')

    emitter.on('run_start', spy.onRunStart)
    emitter.on('run_complete', spy.onRunComplete)
    executor.socketIoSockets.on('execute', spy.onSocketsExecute)
  })

  describe('schedule', () => {
    it('should start the run and pass client config', () => {
      capturedBrowsers.areAllReady = () => true

      executor.schedule()
      expect(spy.onRunStart).to.have.been.called
      expect(spy.onSocketsExecute).to.have.been.calledWith(config.client)
    })

    it('should wait for all browsers to finish', () => {
      capturedBrowsers.areAllReady = () => false

      // they are not ready yet
      executor.schedule()
      expect(spy.onRunStart).not.to.have.been.called
      expect(spy.onSocketsExecute).not.to.have.been.called

      capturedBrowsers.areAllReady = () => true
      emitter.emit('run_complete')
      expect(spy.onRunStart).to.have.been.called
      expect(spy.onSocketsExecute).to.have.been.called
    })
  })

  describe('scheduleError', () => {
    it('should return `true` if scheduled synchronously', () => {
      const result = executor.scheduleError('expected error')
      expect(result).to.be.true
    })

    it('should emit both "run_start" and "run_complete"', () => {
      executor.scheduleError('expected error')
      expect(spy.onRunStart).to.have.been.called
      expect(spy.onRunComplete).to.have.been.called
      expect(spy.onRunStart).to.have.been.calledBefore(spy.onRunComplete)
    })

    it('should report the error', () => {
      const expectedError = 'expected error'
      executor.scheduleError(expectedError)
      expect(spy.onRunComplete).to.have.been.calledWith([], {
        success: 0,
        failed: 0,
        skipped: 0,
        error: expectedError,
        exitCode: 1
      })
    })

    it('should wait for scheduled runs to end before reporting the error', () => {
      // Arrange
      let browsersAreReady = true
      const expectedError = 'expected error'
      capturedBrowsers.areAllReady = () => browsersAreReady
      executor.schedule()
      browsersAreReady = false

      // Act
      const result = executor.scheduleError(expectedError)
      browsersAreReady = true

      // Assert
      expect(result).to.be.false
      expect(spy.onRunComplete).to.not.have.been.called
      emitter.emit('run_complete')
      expect(spy.onRunComplete).to.have.been.calledWith([], sinon.match({
        error: expectedError
      }))
    })
  })
})
