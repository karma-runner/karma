import path = require('path')
var log = require('../logger').create('launcher')
var env = process.env

export class ProcessLauncher {
  private killTimeout = 2000
  private onExitCallback
  private _tempDir
  private _process
  private _killTimer
  private on
  private ENV_CMD
  private DEFAULT_CMD
  private id
  private name
  private _retryLimit
  private state
  private STATE_BEING_CAPTURED
  private STATE_CAPTURED
  private process
  private STATE_BEING_KILLED
  private STATE_BEING_FORCE_KILLED
  private _done

  constructor(private spawn, private tempDir, private timer) {

    this._tempDir = tempDir.getPath('/karma-' + this.id.toString())

    this.on('start', (url) => {
      tempDir.create(this._tempDir)
      this._start(url)
    })

    this.on('kill', (done) => {
      if (!this._process) {
        return process.nextTick(done)
      }

      this.onExitCallback = done
      this._process.kill()
      this._killTimer = timer.setTimeout(this._onKillTimeout, this.killTimeout)
    })

  }

  _start = (url) => {
    this._execCommand(this._getCommand(), this._getOptions(url))
  }

  _getCommand = () => {
    return env[this.ENV_CMD] || this.DEFAULT_CMD[process.platform]
  }

  _getOptions = (url) => {
    return [url]
  }

  // Normalize the command, remove quotes (spawn does not like them).
  _normalizeCommand = (cmd) => {
    if (cmd.charAt(0) === cmd.charAt(cmd.length - 1) && '\'`"'.indexOf(cmd.charAt(0)) !== -1) {
      cmd = cmd.substring(1, cmd.length - 1)
      log.warn('The path should not be quoted.\n  Normalized the path to %s', cmd)
    }

    return path.normalize(cmd)
  }

  _execCommand = (cmd, args) => {
    if (!cmd) {
      log.error('No binary for %s browser on your platform.\n  ' +
        'Please, set "%s" env variable.', this.name, this.ENV_CMD)

      // disable restarting
      this._retryLimit = -1

      return this._clearTempDirAndReportDone('no binary')
    }

    cmd = this._normalizeCommand(cmd)

    log.debug(cmd + ' ' + args.join(' '))
    this._process = this.spawn(cmd, args)

    var errorOutput = ''

    this._process.on('exit', code => {
      this._onProcessExit(code, errorOutput)
    })

    this._process.on('error', err => {
      if (err.code === 'ENOENT') {
        this._retryLimit = -1
        errorOutput = 'Can not find the binary ' + cmd + '\n\t' +
          'Please set env variable ' + this.ENV_CMD
      } else {
        errorOutput += err.toString()
      }
    })
  }

  _onProcessExit = (code, errorOutput) => {
    log.debug('Process %s exited with code %d', this.name, code)

    var error = null

    if (this.state === this.STATE_BEING_CAPTURED) {
      log.error('Cannot start %s\n\t%s', this.name, errorOutput)
      error = 'cannot start'
    }

    if (this.state === this.STATE_CAPTURED) {
      log.error('%s crashed.\n\t%s', this.name, errorOutput)
      error = 'crashed'
    }

    this.process = null
    if (this._killTimer) {
      this.timer.clearTimeout(this._killTimer)
      this._killTimer = null
    }
    this._clearTempDirAndReportDone(error)
  }

  _clearTempDirAndReportDone = (error) => {
    this.tempDir.remove(this._tempDir, () => {
      this._done(error)
      if (this.onExitCallback) {
        this.onExitCallback()
        this.onExitCallback = null
      }
    })
  }

  _onKillTimeout = () =>{
    if (this.state !== this.STATE_BEING_KILLED && this.state !== this.STATE_BEING_FORCE_KILLED) {
      return
    }

    log.warn('%s was not killed in %d ms, sending SIGKILL.', this.name, this.killTimeout)
    this._process.kill('SIGKILL')

    // NOTE: https://github.com/karma-runner/karma/pull/1184
    // NOTE: SIGKILL is just a signal.  Processes should never ignore it, but they can.
    // If a process gets into a state where it doesn't respond in a reasonable amount of time
    // Karma should warn, and continue as though the kill succeeded.
    // This a certainly suboptimal, but it is better than having the test harness hang waiting
    // for a zombie child process to exit.
    this._killTimer = this.timer.setTimeout(() => {
      log.warn('%s was not killed by SIGKILL in %d ms, continuing.', this.name, this.killTimeout)
      this._onProcessExit(-1, '')
    }, this.killTimeout)
  }
  static decoratorFactory(timer) {
    return function (launcher) {
      var spawn = require('child_process').spawn

      var spawnWithoutOutput = function () {
        var proc = spawn.apply(null, arguments)
        proc.stdout.resume()
        proc.stderr.resume()

        return proc
      }

      ProcessLauncher.call(launcher, spawnWithoutOutput, require('../temp_dir'), timer)
    }
  }
}