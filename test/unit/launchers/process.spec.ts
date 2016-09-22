import path from 'path'
import _ from 'lodash'

import BaseLauncher from '../../../lib/launchers/base'
import RetryLauncher from '../../../lib/launchers/retry'
import CaptureTimeoutLauncher from '../../../lib/launchers/capture_timeout'
import ProcessLauncher from '../../../lib/launchers/process'
import {EventEmitter} from '../../../lib/events'
import createMockTimer from '../mocks/timer'

describe('launchers/process.js', () => {
  var emitter
  var mockSpawn
  var mockTempDir
  var launcher

  var BROWSER_PATH = path.normalize('/usr/bin/browser')

  beforeEach(() => {
    emitter = new EventEmitter()
    launcher = new BaseLauncher('fake-id', emitter)

    mockSpawn = sinon.spy(function (cmd, args) {
      var process = new EventEmitter()
      process.stderr = new EventEmitter()
      process.kill = sinon.spy()
      process.exitCode = null
      mockSpawn._processes.push(process)
      return process
    })

    mockSpawn._processes = []

    mockTempDir = {
      getPath: (suffix) => `/temp${suffix}`,
      create: sinon.spy(),
      remove: sinon.spy()
    }
  })

  it('should create a temp directory', () => {
    ProcessLauncher.call(launcher, mockSpawn, mockTempDir)
    launcher._getCommand = () => null

    launcher.start('http://host:9988/')
    expect(launcher._tempDir).to.equal('/temp/karma-fake-id')
    expect(mockTempDir.create).to.have.been.calledWith('/temp/karma-fake-id')
  })

  it('should remove the temp directory', (done) => {
    ProcessLauncher.call(launcher, mockSpawn, mockTempDir)
    launcher._getCommand = () => null

    launcher.start('http://host:9988/')
    launcher.kill()

    _.defer(() => {
      expect(mockTempDir.remove).to.have.been.called
      expect(mockTempDir.remove.args[0][0]).to.equal('/temp/karma-fake-id')
      done()
    })
  })

  describe('_normalizeCommand', () => {
    it('should remove quotes from the cmd', () => {
      ProcessLauncher.call(launcher, null, mockTempDir)

      expect(launcher._normalizeCommand('"/bin/brow ser"')).to.equal(path.normalize('/bin/brow ser'))
      expect(launcher._normalizeCommand("'/bin/brow ser'")).to.equal
      path.normalize('/bin/brow ser')
      expect(launcher._normalizeCommand('`/bin/brow ser`')).to.equal(path.normalize('/bin/brow ser'))
    })
  })

  describe('with RetryLauncher', () => {
    it('should handle spawn ENOENT error and not even retry', (done) => {
      ProcessLauncher.call(launcher, mockSpawn, mockTempDir)
      RetryLauncher.call(launcher, 2)
      launcher._getCommand = () => BROWSER_PATH

      var failureSpy = sinon.spy()
      emitter.on('browser_process_failure', failureSpy)

      launcher.start('http://host:9876/')
      mockSpawn._processes[0].emit('error', {code: 'ENOENT'})
      mockSpawn._processes[0].emit('exit', 1)
      mockTempDir.remove.callArg(1)

      _.defer(() => {
        expect(launcher.state).to.equal(launcher.STATE_FINISHED)
        expect(failureSpy).to.have.been.called
        done()
      })
    })
  })

  // higher level tests with Retry and CaptureTimeout launchers
  describe('flow', () => {
    var failureSpy
    var mockTimer = failureSpy = null

    beforeEach(() => {
      mockTimer = createMockTimer()
      CaptureTimeoutLauncher.call(launcher, mockTimer, 100)
      ProcessLauncher.call(launcher, mockSpawn, mockTempDir, mockTimer)
      RetryLauncher.call(launcher, 2)

      launcher._getCommand = () => BROWSER_PATH

      failureSpy = sinon.spy()
      emitter.on('browser_process_failure', failureSpy)
    })

    // the most common scenario, when everything works fine
    it('start -> capture -> kill', (done) => {
      // start the browser
      launcher.start('http://localhost/')
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])

      // mark captured
      launcher.markCaptured()

      // kill it
      var killingLauncher = launcher.kill()
      expect(launcher.state).to.equal(launcher.STATE_BEING_KILLED)
      expect(mockSpawn._processes[0].kill).to.have.been.called

      // process exits
      mockSpawn._processes[0].emit('exit', 0)
      mockTempDir.remove.callArg(1)

      killingLauncher.done(() => {
        expect(launcher.state).to.equal(launcher.STATE_FINISHED)
        done()
      })
    })

    // when the browser fails to get captured in given timeout, it should restart
    it('start -> timeout -> restart', (done) => {
      // start
      launcher.start('http://localhost/')

      // expect starting the process
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
      var browserProcess = mockSpawn._processes.shift()

      // timeout
      mockTimer.wind(101)

      // expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit('exit', 0)
      mockTempDir.remove.callArg(1)
      mockSpawn.reset()

      _.defer(() => {
        // expect re-starting
        expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
        expect(failureSpy).not.to.have.been.called
        done()
      })
    })

    it('start -> timeout -> 3xrestart -> failure', (done) => {
      // start
      launcher.start('http://localhost/')

      // expect starting
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
      var browserProcess = mockSpawn._processes.shift()
      mockSpawn.reset()

      // timeout - first time
      mockTimer.wind(101)

      // expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit('exit', 0)
      mockTempDir.remove.callArg(1)
      mockTempDir.remove.reset()

      _.defer(() => {
        // expect re-starting
        expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
        browserProcess = mockSpawn._processes.shift()
        expect(failureSpy).not.to.have.been.called
        mockSpawn.reset()

        // timeout - second time
        mockTimer.wind(101)

        // expect killing browser
        expect(browserProcess.kill).to.have.been.called
        browserProcess.emit('exit', 0)
        mockTempDir.remove.callArg(1)
        mockTempDir.remove.reset()

        _.defer(() => {
          // expect re-starting
          expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
          browserProcess = mockSpawn._processes.shift()
          expect(failureSpy).not.to.have.been.called
          mockSpawn.reset()

          // timeout - third time
          mockTimer.wind(201)

          // expect killing browser
          expect(browserProcess.kill).to.have.been.called
          browserProcess.emit('exit', 0)
          mockTempDir.remove.callArg(1)
          mockTempDir.remove.reset()

          _.defer(() => {
            expect(mockSpawn).to.not.have.been.called
            expect(failureSpy).to.have.been.called
            done()
          })
        })
      })
    })

    // when the browser fails to start, it should restart
    it('start -> crash -> restart', (done) => {
      // start
      launcher.start('http://localhost/')

      // expect starting the process
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
      var browserProcess = mockSpawn._processes.shift()
      mockSpawn.reset()

      // crash
      browserProcess.emit('exit', 1)
      mockTempDir.remove.callArg(1)
      mockTempDir.remove.reset()

      _.defer(() => {
        // expect re-starting
        expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
        browserProcess = mockSpawn._processes.shift()

        expect(failureSpy).not.to.have.been.called
        done()
      })
    })
  })
})
