const path = require('path')
const log = require('../logger').create('launcher')
const env = process.env

function ProcessLauncher (spawn, tempDir, timer, processKillTimeout) {
  const self = this
  let onExitCallback
  const killTimeout = processKillTimeout || 2000
  const streamedOutputs = {stdout: '', stderr: ''} // Will hold output from the spawned child process
  this._tempDir = tempDir.getPath(`/karma-${this.id.toString()}`)

  this.on('start', (url) => {
    tempDir.create(self._tempDir)
    self._start(url)
  })

  this.on('kill', (done) => {
    if (!self._process) {
      return process.nextTick(done)
    }

    onExitCallback = done
    self._process.kill()
    self._killTimer = timer.setTimeout(self._onKillTimeout, killTimeout)
  })

  this._start = function (url) {
    self._execCommand(self._getCommand(), self._getOptions(url))
  }

  this._getCommand = function () {
    return env[self.ENV_CMD] || self.DEFAULT_CMD[process.platform]
  }

  this._getOptions = function (url) {
    return [url]
  }

  // Normalize the command, remove quotes (spawn does not like them).
  this._normalizeCommand = function (cmd) {
    if (cmd.charAt(0) === cmd.charAt(cmd.length - 1) && '\'`"'.includes(cmd.charAt(0))) {
      log.warn(`The path should not be quoted.\n  Normalized the path to ${cmd}`)
      cmd = cmd.substring(1, cmd.length - 1)
    }

    return path.normalize(cmd)
  }

  this._execCommand = function (cmd, args) {
    if (!cmd) {
      log.error(`No binary for ${self.name} browser on your platform.\n  Please, set "${self.ENV_CMD}" env variable.`)

      self._retryLimit = -1 // disable restarting
      return self._clearTempDirAndReportDone('no binary')
    }

    cmd = this._normalizeCommand(cmd)

    log.debug(cmd + ' ' + args.join(' '))
    self._process = spawn(cmd, args)
    let errorOutput = ''

    self._process.stdout.on('data', (data) => {
      streamedOutputs.stdout += data
    })

    self._process.stderr.on('data', (data) => {
      streamedOutputs.stderr += data
    })

    self._process.on('exit', (code) => {
      self._onProcessExit(code, errorOutput)
    })

    self._process.on('error', (err) => {
      if (err.code === 'ENOENT') {
        self._retryLimit = -1
        errorOutput = `Can not find the binary ${cmd}\n\tPlease set env variable ${self.ENV_CMD}`
      } else {
        errorOutput += err.toString()
      }
    })

    self._process.stderr.on('data', (errBuff) => {
      errorOutput += errBuff.toString()
    })
  }

  this._onProcessExit = function (code, errorOutput) {
    log.debug(`Process ${self.name} exited with code ${code}`)

    let error = null

    if (self.state === self.STATE_BEING_CAPTURED) {
      log.error(`Cannot start ${self.name}\n\t${errorOutput}`)
      error = 'cannot start'
    }

    if (self.state === self.STATE_CAPTURED) {
      log.error(`${self.name} crashed.\n\t${errorOutput}`)
      error = 'crashed'
    }

    if (error) {
      log.error(`${self.name} stdout: ${streamedOutputs.stdout}`)
      log.error(`${self.name} stderr: ${streamedOutputs.stderr}`)
    }

    self._process = null
    streamedOutputs.stdout = ''
    streamedOutputs.stderr = ''
    if (self._killTimer) {
      timer.clearTimeout(self._killTimer)
      self._killTimer = null
    }
    self._clearTempDirAndReportDone(error)
  }

  this._clearTempDirAndReportDone = function (error) {
    tempDir.remove(self._tempDir, () => {
      self._done(error)
      if (onExitCallback) {
        onExitCallback()
        onExitCallback = null
      }
    })
  }

  this._onKillTimeout = function () {
    if ([self.STATE_BEING_KILLED, self.STATE_BEING_FORCE_KILLED].includes(self.state)) {
      log.warn(`${self.name} was not killed in ${killTimeout} ms, sending SIGKILL.`)
      self._process.kill('SIGKILL')

      // NOTE: https://github.com/karma-runner/karma/pull/1184
      self._killTimer = timer.setTimeout(() => {
        log.warn(`${self.name} was not killed by SIGKILL in ${killTimeout} ms, continuing.`)
        self._onProcessExit(-1, '')
      }, killTimeout)
    }
  }
}

ProcessLauncher.decoratorFactory = function (timer) {
  return function (launcher, processKillTimeout) {
    const spawn = require('child_process').spawn

    function spawnWithoutOutput () {
      const proc = spawn.apply(null, arguments)
      proc.stdout.resume()
      proc.stderr.resume()

      return proc
    }

    ProcessLauncher.call(launcher, spawnWithoutOutput, require('../temp_dir'), timer, processKillTimeout)
  }
}

module.exports = ProcessLauncher
