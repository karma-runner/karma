module.exports = function coreSteps () {
  var fs = require('fs')
  var path = require('path')
  var ref = require('child_process')
  var exec = ref.exec
  var spawn = ref.spawn
  var rimraf = require('rimraf')

  this.World = require('../support/world').World
  require('../support/after_hooks').call(this)

  var baseDir = fs.realpathSync(path.join(__dirname, '/../../..'))
  var tmpDir = path.join(baseDir, 'tmp', 'sandbox')
  var tmpConfigFile = 'karma.conf.js'
  var cleansingNeeded = true
  var additionalArgs = []

  var cleanseIfNeeded = (function (_this) {
    return function () {
      if (cleansingNeeded) {
        try {
          rimraf.sync(tmpDir)
        } catch (e) {}

        cleansingNeeded = false

        return cleansingNeeded
      }
    }
  })(this)

  this.Given(/^a configuration with:$/, function (fileContent, callback) {
    cleanseIfNeeded()
    this.addConfigContent(fileContent)
    return callback()
  })

  this.Given(/^command line arguments of: "([^"]*)"$/, function (args, callback) {
    additionalArgs = args
    return callback()
  })

  this.When(/^I (run|runOut|start|init) Karma$/, function (command, callback) {
    this.writeConfigFile(tmpDir, tmpConfigFile, (function (_this) {
      return function (err, hash) {
        if (err) {
          return callback.fail(new Error(err))
        }

        var configFile = path.join(tmpDir, hash + '.' + tmpConfigFile)
        var runtimePath = path.join(baseDir, 'bin', 'karma')
        var execKarma = function (done) {
          var cmd = runtimePath + ' ' + command + ' --log-level warn ' + configFile + ' ' + additionalArgs

          return exec(cmd, {
            cwd: baseDir
          }, done)
        }
        var runOut = command === 'runOut'
        if (command === 'run' || command === 'runOut') {
          _this.child = spawn('' + runtimePath, ['start', '--log-level', 'warn', configFile])
          var done = function () {
            cleansingNeeded = true
            _this.child && _this.child.kill()
            callback()
          }

          _this.child.on('error', function (error) {
            _this.lastRun.error = error
            done()
          })

          _this.child.stderr.on('data', function (chunk) {
            _this.lastRun.stderr += chunk.toString()
          })

          _this.child.stdout.on('data', function (chunk) {
            _this.lastRun.stdout += chunk.toString()
            var cmd = runtimePath + ' run ' + configFile + ' ' + additionalArgs

            setTimeout(function () {
              exec(cmd, {
                cwd: baseDir
              }, function (error, stdout) {
                if (error) {
                  _this.lastRun.error = error
                }
                if (runOut) {
                  _this.lastRun.stdout = stdout
                }
                done()
              })
            }, 1000)
          })
        } else {
          execKarma(function (error, stdout, stderr) {
            if (error) {
              _this.lastRun.error = error
            }
            _this.lastRun.stdout = stdout
            _this.lastRun.stderr = stderr
            cleansingNeeded = true
            callback()
          })
        }
      }
    })(this))
  })

  this.Then(/^it passes with( no debug)?:$/, {timeout: 10 * 1000}, function (noDebug, expectedOutput, callback) {
    noDebug = noDebug === ' no debug'
    var actualOutput = this.lastRun.stdout.toString()
    var actualError = this.lastRun.error
    var actualStderr = this.lastRun.stderr.toString()
    var lines

    if (noDebug) {
      lines = actualOutput.split('\n').filter(function (line) {
        return !line.match(/\[DEBUG\]/)
      })
      actualOutput = lines.join('\n')
    }

    if (actualOutput.indexOf(expectedOutput) >= 0) {
      return callback()
    }

    if (actualError || actualStderr) {
      return callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
    }

    callback(new Error('Failed all comparissons'))
  })

  this.Then(/^it fails with:$/, function (expectedOutput, callback) {
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

  this.Then(/^it fails with like:$/, function (expectedOutput, callback) {
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
}
