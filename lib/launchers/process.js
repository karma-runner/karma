var path = require('path')
var log = require('../logger').create('launcher')
var env = process.env

var ProcessLauncher = function (spawn, tempDir, timer, processKillTimeout) {
  var self = this
  var onExitCallback
  var killTimeout = processKillTimeout || 2000
  // Will hold output from the spawned child process
  var streamedOutputs = {
    stdout: '',
    stderr: ''
  }

  this._tempDir = tempDir.getPath('/karma-' + this.id.toString())

  this.on('start', function (url) {
    tempDir.create(self._tempDir)
    self._start(url)
  })

  this.on('kill', function (done) {
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
    if (cmd.charAt(0) === cmd.charAt(cmd.length - 1) && '\'`"'.indexOf(cmd.charAt(0)) !== -1) {
      cmd = cmd.substring(1, cmd.length - 1)
      log.warn('The path should not be quoted.\n  Normalized the path to %s', cmd)
    }

    return path.normalize(cmd)
  }

  this._onStdout = function (data) {
    streamedOutputs.stdout += data
  }

  this._onStderr = function (data) {
    streamedOutputs.stderr += data
  }

  this._execCommand = function (cmd, args) {
    if (!cmd) {
      log.error('No binary for %s browser on your platform.\n  ' +
        'Please, set "%s" env variable.', self.name, self.ENV_CMD)

      // disable restarting
      self._retryLimit = -1

      return self._clearTempDirAndReportDone('no binary')
    }

    cmd = this._normalizeCommand(cmd)

    log.debug(cmd + ' ' + args.join(' '))
    self._process = spawn(cmd, args)
    var errorOutput = ''

    self._process.stdout.on('data', self._onStdout)

    self._process.stderr.on('data', self._onStderr)

    self._process.on('exit', function (code) {
      self._onProcessExit(code, errorOutput)
    })

    self._process.on('error', function (err) {
      if (err.code === 'ENOENT') {
        self._retryLimit = -1
        errorOutput = 'Can not find the binary ' + cmd + '\n\t' +
          'Please set env variable ' + self.ENV_CMD
      } else {
        errorOutput += err.toString()
      }
    })

    self._process.stderr.on('data', function (errBuff) {
      errorOutput += errBuff.toString()
    })
  }

  this._onProcessExit = function (code, errorOutput) {
    log.debug('Process %s exited with code %d', self.name, code)

    var error = null

    if (self.state === self.STATE_BEING_CAPTURED) {
      log.error('Cannot start %s\n\t%s', self.name, errorOutput)
      error = 'cannot start'
    }

    if (self.state === self.STATE_CAPTURED) {
      log.error('%s crashed.\n\t%s', self.name, errorOutput)
      error = 'crashed'
    }

    if (error) {
      log.error('%s stdout: %s', self.name, streamedOutputs.stdout)
      log.error('%s stderr: %s', self.name, streamedOutputs.stderr)
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
    tempDir.remove(self._tempDir, function () {
      self._done(error)
      if (onExitCallback) {
        onExitCallback()
        onExitCallback = null
      }
    })
  }

  this._onKillTimeout = function () {
    if (self.state !== self.STATE_BEING_KILLED && self.state !== self.STATE_BEING_FORCE_KILLED) {
      return
    }

    log.warn('%s was not killed in %d ms, sending SIGKILL.', self.name, killTimeout)
    self._process.kill('SIGKILL')

    // NOTE: https://github.com/karma-runner/karma/pull/1184
    // NOTE: SIGKILL is just a signal.  Processes should never ignore it, but they can.
    // If a process gets into a state where it doesn't respond in a reasonable amount of time
    // Karma should warn, and continue as though the kill succeeded.
    // This a certainly suboptimal, but it is better than having the test harness hang waiting
    // for a zombie child process to exit.
    self._killTimer = timer.setTimeout(function () {
      log.warn('%s was not killed by SIGKILL in %d ms, continuing.', self.name, killTimeout)
      self._onProcessExit(-1, '')
    }, killTimeout)
  }
}

ProcessLauncher.decoratorFactory = function (timer) {
  return function (launcher, processKillTimeout) {
    var spawn = require('child_process').spawn

    var spawnWithoutOutput = function () {
      var proc = spawn.apply(null, arguments)
      proc.stdout.resume()
      proc.stderr.resume()

      return proc
    }

    ProcessLauncher.call(launcher, spawnWithoutOutput, require('../temp_dir'), timer, processKillTimeout)
  }
}

module.exports = ProcessLauncher
