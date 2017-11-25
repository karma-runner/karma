var cucumber = require('cucumber')
var fs = require('fs')
var path = require('path')
var ref = require('child_process')
var exec = ref.exec
var spawn = ref.spawn
var rimraf = require('rimraf')
var stopper = require('../../../lib/stopper')

cucumber.defineSupportCode((a) => {
  var When = a.When
  var Then = a.Then
  var Given = a.Given
  var defineParameterType = a.defineParameterType

  var baseDir = fs.realpathSync(path.join(__dirname, '/../../..'))
  var tmpDir = path.join(baseDir, 'tmp', 'sandbox')
  var tmpConfigFile = 'karma.conf.js'
  var cleansingNeeded = true
  var additionalArgs = []

  var cleanseIfNeeded = function () {
    if (cleansingNeeded) {
      try {
        rimraf.sync(tmpDir)
      } catch (e) {
      }

      cleansingNeeded = false

      return cleansingNeeded
    }
  }

  function execKarma (command, level, proxyPort, proxyPath, callback) {
    level = level || 'warn'

    var startProxy = (done) => {
      if (proxyPort) {
        this.proxy.start(proxyPort, proxyPath, done)
      } else {
        done()
      }
    }

    startProxy((err) => {
      if (err) {
        return callback.fail(err)
      }

      this.writeConfigFile(tmpDir, tmpConfigFile, (err, hash) => {
        if (err) {
          return callback.fail(new Error(err))
        }
        var configFile = path.join(tmpDir, hash + '.' + tmpConfigFile)
        var runtimePath = path.join(baseDir, 'bin', 'karma')

        var executor = (done) => {
          var cmd = runtimePath + ' ' + command + ' --log-level ' + level + ' ' + configFile + ' ' + additionalArgs

          return exec(cmd, {
            cwd: baseDir
          }, done)
        }

        var runOut = command === 'runOut'
        if (command === 'run' || command === 'runOut') {
          this.child = spawn('' + runtimePath, ['start', '--log-level', 'warn', configFile])
          var done = () => {
            cleansingNeeded = true
            this.child && this.child.kill()
            callback()
          }

          this.child.on('error', (error) => {
            this.lastRun.error = error
            done()
          })

          this.child.stderr.on('data', (chunk) => {
            this.lastRun.stderr += chunk.toString()
          })

          this.child.stdout.on('data', (chunk) => {
            this.lastRun.stdout += chunk.toString()
            var cmd = runtimePath + ' run ' + configFile + ' ' + additionalArgs
            setTimeout(() => {
              exec(cmd, {
                cwd: baseDir
              }, (error, stdout) => {
                if (error) {
                  this.lastRun.error = error
                }
                if (runOut) {
                  this.lastRun.stdout = stdout
                }
                done()
              })
            }, 1000)
          })
        } else {
          executor((error, stdout, stderr) => {
            if (error) {
              this.lastRun.error = error
            }
            this.lastRun.stdout = stdout
            this.lastRun.stderr = stderr
            cleansingNeeded = true
            callback()
          })
        }
      })
    })
  }

  Given('a configuration with:', function (fileContent, callback) {
    cleanseIfNeeded()
    this.addConfigContent(fileContent)
    return callback()
  })

  Given('command line arguments of: {string}', function (args, callback) {
    additionalArgs = args
    return callback()
  })

  When('I stop a server programmatically', function (callback) {
    var _this = this
    setTimeout(function () {
      stopper.stop(_this.configFile, function (exitCode) {
        _this.stopperExitCode = exitCode
      })
      callback()
    }, 1000)
  })

  When('I start a server in background', function (callback) {
    this.writeConfigFile(tmpDir, tmpConfigFile, (function (_this) {
      return function (err, hash) {
        if (err) {
          return callback.fail(new Error(err))
        }
        var configFile = path.join(tmpDir, hash + '.' + tmpConfigFile)
        var runtimePath = path.join(baseDir, 'bin', 'karma')
        _this.child = spawn('' + runtimePath, ['start', '--log-level', 'debug', configFile])
        _this.child.stdout.on('data', function () {
          callback()
          callback = function () {
          }
        })
        _this.child.on('exit', function (exitCode) {
          _this.childExitCode = exitCode
        })
      }
    })(this))
  })

  defineParameterType({
    name: 'command',
    regexp: /run|runOut|start|init|stop/
  })

  defineParameterType({
    name: 'loglevel',
    regexp: /info|error|warn|debug/
  })

  When('I {command} Karma', function (command, callback) {
    execKarma.apply(this, [command, undefined, undefined, undefined, callback])
  })

  When('I {command} Karma with log-level {loglevel}', function (command, level, callback) {
    execKarma.apply(this, [command, level, undefined, undefined, callback])
  })

  When('I {command} Karma behind a proxy on port {int} that prepends {string} to the base path', function (command, proxyPort, proxyPath, callback) {
    execKarma.apply(this, [command, undefined, proxyPort, proxyPath, callback])
  })

  defineParameterType({
    name: 'exact',
    regexp: /no\sdebug|like/
  })

  Then('it passes with( {exact}):', {timeout: 10 * 1000}, function (mode, expectedOutput, callback) {
    var noDebug = mode === 'no debug'
    var like = mode === 'like'
    var actualOutput = this.lastRun.stdout.toString()
    var lines

    if (noDebug) {
      lines = actualOutput.split('\n').filter(function (line) {
        return !line.match(/\[DEBUG\]/)
      })
      actualOutput = lines.join('\n')
    }
    if (like && actualOutput.indexOf(expectedOutput) >= 0) {
      return callback()
    }

    if (actualOutput.indexOf(expectedOutput) === 0) {
      return callback()
    }

    if (actualOutput) {
      return callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
    }

    callback(new Error('Failed all comparissons'))
  })

  Then('it fails with:', function (expectedOutput, callback) {
    var actualOutput = this.lastRun.stdout.toString()
    var actualError = this.lastRun.error
    var actualStderr = this.lastRun.stderr.toString()

    if (actualOutput.match(expectedOutput)) {
      return callback()
    }

    if (actualError || actualStderr) {
      return callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
    }
  })

  Then('it fails with like:', function (expectedOutput, callback) {
    var actualOutput = this.lastRun.stdout.toString()
    var actualError = this.lastRun.error
    var actualStderr = this.lastRun.stderr.toString()
    if (actualOutput.match(new RegExp(expectedOutput))) {
      return callback()
    }

    if (actualError || actualStderr) {
      callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
    }
  })

  defineParameterType({
    name: 'component',
    regexp: /server|stopper/
  })

  Then('The {component} is dead( with exit code {int})',
    function (stopperOrServer, code, callback) {
      var server = stopperOrServer === 'server'
      var _this = this
      setTimeout(function () {
        var actualExitCode = server ? _this.childExitCode : _this.stopperExitCode
        if (actualExitCode === undefined) return callback(new Error('Server has not exited.'))
        if (code === undefined || parseInt(code, 10) === actualExitCode) return callback()
        callback(new Error('Exit-code mismatch'))
      }, 4000)
    })

  Then(/^the file at ([a-zA-Z0-9/\\_.]+) contains:$/,
    function (filePath, expectedOutput, callback) {
      var data = fs.readFileSync(filePath, {encoding: 'UTF-8'})
      if (data.match(expectedOutput)) {
        return callback()
      }
      callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + data))
    })
})
