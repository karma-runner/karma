'use strict'

const Browser = require('../../lib/browser')
const BrowserCollection = require('../../lib/browser_collection')
const EventEmitter = require('../../lib/events').EventEmitter
const Executor = require('../../lib/executor')

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
      onRunStart: () => null,
      onSocketsExecute: () => null
    }

    sinon.spy(spy, 'onRunStart')
    sinon.spy(spy, 'onSocketsExecute')

    emitter.on('run_start', spy.onRunStart)
    executor.socketIoSockets.on('execute', spy.onSocketsExecute)
  })

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
