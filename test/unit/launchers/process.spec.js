const path = require('path')
const _ = require('lodash')

const BaseLauncher = require('../../../lib/launchers/base')
const RetryLauncher = require('../../../lib/launchers/retry')
const CaptureTimeoutLauncher = require('../../../lib/launchers/capture_timeout')
const ProcessLauncher = require('../../../lib/launchers/process')
const EventEmitter = require('../../../lib/events').EventEmitter
const createMockTimer = require('../mocks/timer')
const logger = require('../../../lib/logger')

describe('launchers/process.js', () => {
  let emitter
  let mockSpawn
  let mockTempDir
  let launcher
  let logErrorSpy
  let logDebugSpy

  const BROWSER_PATH = path.normalize('/usr/bin/browser')

  beforeEach(() => {
    emitter = new EventEmitter()
    launcher = new BaseLauncher('fake-id', emitter)
    launcher.name = 'fake-name'
    launcher.ENV_CMD = 'fake-ENV-CMD'
    logErrorSpy = sinon.spy(logger.create('launcher'), 'error')
    logDebugSpy = sinon.spy(logger.create('launcher'), 'debug')

    mockSpawn = sinon.spy(function (cmd, args) {
      const process = new EventEmitter()
      process.stdout = new EventEmitter()
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
    function assertSpawnError ({ errorCode, emitExit, expectedError }, done) {
      ProcessLauncher.call(launcher, mockSpawn, mockTempDir)
      RetryLauncher.call(launcher, 2)
      launcher._getCommand = () => BROWSER_PATH

      const failureSpy = sinon.spy()
      emitter.on('browser_process_failure', failureSpy)

      launcher.start('http://host:9876/')
      mockSpawn._processes[0].emit('error', { code: errorCode })
      if (emitExit) {
        mockSpawn._processes[0].emit('exit', 1)
      }
      mockTempDir.remove.callArg(1)

      _.defer(() => {
        expect(launcher.state).to.equal(launcher.STATE_FINISHED)
        expect(failureSpy).to.have.been.called
        expect(logDebugSpy).to.have.been.callCount(5)
        expect(logDebugSpy.getCall(0)).to.have.been.calledWithExactly('null -> BEING_CAPTURED')
        expect(logDebugSpy.getCall(1)).to.have.been.calledWithExactly(`${BROWSER_PATH} http://host:9876/?id=fake-id`)
        expect(logDebugSpy.getCall(2)).to.have.been.calledWithExactly('Process fake-name exited with code -1 and signal null')
        expect(logDebugSpy.getCall(3)).to.have.been.calledWithExactly('fake-name failed (cannot start). Not restarting.')
        expect(logDebugSpy.getCall(4)).to.have.been.calledWithExactly('BEING_CAPTURED -> FINISHED')
        expect(logErrorSpy).to.have.been.calledWith(expectedError)
        done()
      })
    }

    it('should handle spawn ENOENT error and not even retry', (done) => {
      assertSpawnError({
        errorCode: 'ENOENT',
        emitExit: true,
        expectedError: `Cannot start fake-name\n\tCan not find the binary ${BROWSER_PATH}\n\tPlease set env variable fake-ENV-CMD`
      }, done)
    })

    it('should handle spawn EACCES error and not even retry', (done) => {
      assertSpawnError({
        errorCode: 'EACCES',
        emitExit: true,
        expectedError: `Cannot start fake-name\n\tPermission denied accessing the binary ${BROWSER_PATH}\n\tMaybe it's a directory?`
      }, done)
    })

    it('should handle spawn ENOENT error and report the error when exit event is not emitted', (done) => {
      assertSpawnError({
        errorCode: 'ENOENT',
        emitExit: false,
        expectedError: `Cannot start fake-name\n\tCan not find the binary ${BROWSER_PATH}\n\tPlease set env variable fake-ENV-CMD`
      }, done)
    })

    it('should handle spawn EACCES error and report the error when exit event is not emitted', (done) => {
      assertSpawnError({
        errorCode: 'EACCES',
        emitExit: false,
        expectedError: `Cannot start fake-name\n\tPermission denied accessing the binary ${BROWSER_PATH}\n\tMaybe it's a directory?`
      }, done)
    })
  })

  // higher level tests with Retry and CaptureTimeout launchers
  describe('flow', () => {
    let failureSpy
    let mockTimer = failureSpy = null

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
    it('start -> capture -> kill', async () => {
      // start the browser
      launcher.start('http://localhost/')
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])

      // mark captured
      launcher.markCaptured()

      // kill it
      const killingLauncher = launcher.kill()
      expect(launcher.state).to.equal(launcher.STATE_BEING_KILLED)
      expect(mockSpawn._processes[0].kill).to.have.been.called

      // process exits
      mockSpawn._processes[0].emit('exit', 0)
      mockTempDir.remove.callArg(1)

      await killingLauncher

      expect(launcher.state).to.equal(launcher.STATE_FINISHED)
    })

    // when the browser fails to get captured in default timeout, it should restart
    it('start -> timeout -> restart', (done) => {
      const stdOutSpy = sinon.spy(launcher, '_onStdout')
      const stdErrSpy = sinon.spy(launcher, '_onStderr')

      // start
      launcher.start('http://localhost/')

      // expect starting the process
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
      const browserProcess = mockSpawn._processes.shift()

      const expectedStdoutString = 'starting...'
      const expectedStderrString = 'Oops...there was a problem'
      browserProcess.stdout.emit('data', expectedStdoutString)
      browserProcess.stderr.emit('data', expectedStderrString)

      // timeout
      mockTimer.wind(101)

      // We must've caught some output
      expect(stdOutSpy).to.have.been.called
      expect(stdErrSpy).to.have.been.called

      stdOutSpy.calledWith(expectedStdoutString)

      // expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit('exit', 0)
      mockTempDir.remove.callArg(1)
      mockSpawn.resetHistory()

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

      let browserProcess = mockSpawn._processes.shift()
      mockSpawn.resetHistory()

      // timeout - first time
      mockTimer.wind(101)

      // expect killing browser
      expect(browserProcess.kill).to.have.been.called
      browserProcess.emit('exit', 0)
      mockTempDir.remove.callArg(1)
      mockTempDir.remove.resetHistory()

      _.defer(() => {
        // expect re-starting
        expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
        browserProcess = mockSpawn._processes.shift()
        expect(failureSpy).not.to.have.been.called
        mockSpawn.resetHistory()

        // timeout - second time
        mockTimer.wind(101)

        // expect killing browser
        expect(browserProcess.kill).to.have.been.called
        browserProcess.emit('exit', 0)
        mockTempDir.remove.callArg(1)
        mockTempDir.remove.resetHistory()

        _.defer(() => {
          // expect re-starting
          expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
          browserProcess = mockSpawn._processes.shift()
          expect(failureSpy).not.to.have.been.called
          mockSpawn.resetHistory()

          // timeout - third time
          mockTimer.wind(201)

          // expect killing browser
          expect(browserProcess.kill).to.have.been.called
          browserProcess.emit('exit', 0)
          mockTempDir.remove.callArg(1)
          mockTempDir.remove.resetHistory()

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
      let browserProcess = mockSpawn._processes.shift()
      mockSpawn.resetHistory()

      // crash
      browserProcess.emit('exit', 1)
      mockTempDir.remove.callArg(1)
      mockTempDir.remove.resetHistory()

      _.defer(() => {
        // expect re-starting
        expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
        browserProcess = mockSpawn._processes.shift()

        expect(failureSpy).not.to.have.been.called
        done()
      })
    })
  })

  // higher level tests - process kill timeout
  describe('process-kill-timeout', () => {
    let failureSpy
    let mockTimer = null

    beforeEach(() => {
      mockTimer = createMockTimer()
      CaptureTimeoutLauncher.call(launcher, mockTimer, 100)
      ProcessLauncher.call(launcher, mockSpawn, mockTempDir, mockTimer, 300)
      RetryLauncher.call(launcher, 2)

      launcher._getCommand = () => BROWSER_PATH

      failureSpy = sinon.spy()
      emitter.on('browser_process_failure', failureSpy)
    })

    // when the browser fails to get captured in default timeout, it should restart
    it('start -> capture_timeout -> kill -> process_kill_timeout -> sigkill', () => {
      // start
      launcher.start('http://localhost/')

      // expect starting the process
      expect(mockSpawn).to.have.been.calledWith(BROWSER_PATH, ['http://localhost/?id=fake-id'])
      const browserProcess = mockSpawn._processes.shift()

      // timeout
      mockTimer.wind(101)

      // expect killing browser
      expect(browserProcess.kill).to.have.been.called

      // processKillTimeout not reached yet
      mockTimer.wind(299)

      // SIGKILL not called yet
      expect(browserProcess.kill.withArgs('SIGKILL')).not.to.have.been.called

      // processKillTimeout
      mockTimer.wind(301)

      // expect killing with SIGKILL
      expect(browserProcess.kill.withArgs('SIGKILL')).to.have.been.called

      browserProcess.emit('exit', 0)
      mockTempDir.remove.callArg(1)
      mockTempDir.remove.resetHistory()
      mockSpawn.resetHistory()
    })
  })
})
