const { defineParameterType, Given, Then, When } = require('cucumber')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { waitForCondition } = require('./utils')
const stopper = require('../../../lib/stopper')

let additionalArgs = []

function execKarma (command, level, callback) {
  level = level || 'warn'

  const cmd = `${this.karmaExecutable} ${command} --log-level ${level} ${this.configFile} ${additionalArgs}`
  exec(cmd, { cwd: this.workDir }, (error, stdout, stderr) => {
    this.lastRun.error = error
    this.lastRun.stdout = stdout.toString()
    this.lastRun.stderr = stderr.toString()
    callback()
  })
}

Given('a default configuration', function () {
  this.writeConfigFile()
})

Given('a configuration with:', function (fileContent) {
  this.updateConfig(fileContent)
  this.writeConfigFile()
})

Given('command line arguments of: {string}', function (args, callback) {
  additionalArgs = args
  return callback()
})

Given('a proxy on port {int} that prepends {string} to the base path', async function (proxyPort, proxyPath) {
  return this.proxy.start(proxyPort, proxyPath)
})

When('I stop a server programmatically', function (callback) {
  setTimeout(() => {
    stopper.stop(this.config, (exitCode) => {
      this.stopperExitCode = exitCode
      callback()
    })
  }, 1000)
})

When('I start a server in background', async function () {
  await this.runBackgroundProcess(['start', '--log-level', 'debug', this.configFile])
})

When('I wait until server output contains:', async function (expectedOutput) {
  await waitForCondition(() => this.backgroundProcess.stdout.includes(expectedOutput))
})

defineParameterType({
  name: 'command',
  regexp: /run|start|init|stop/
})

defineParameterType({
  name: 'loglevel',
  regexp: /info|error|warn|debug/
})

When('I {command} Karma', function (command, callback) {
  execKarma.apply(this, [command, undefined, callback])
})

When('I {command} Karma with log-level {loglevel}', function (command, level, callback) {
  execKarma.apply(this, [command, level, callback])
})

Then(/^it passes with(:? (no\sdebug|like|regexp))?:$/, { timeout: 10 * 1000 }, function (mode, expectedOutput, callback) {
  const noDebug = mode === 'no debug'
  const like = mode === 'like'
  const regexp = mode === 'regexp'
  let actualOutput = this.lastRun.stdout
  let lines

  if (noDebug) {
    lines = actualOutput.split('\n').filter(function (line) {
      return !line.match(/\[DEBUG\]/)
    })
    actualOutput = lines.join('\n')
  }
  if (like && actualOutput.indexOf(expectedOutput) >= 0) {
    return callback()
  }
  if (regexp && actualOutput.match(expectedOutput)) {
    return callback()
  }
  if (actualOutput.indexOf(expectedOutput) === 0) {
    return callback()
  }

  if (actualOutput) {
    return callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
  }

  callback(new Error('Failed all comparisons'))
})

Then('it fails with:', function (expectedOutput, callback) {
  const actualOutput = this.lastRun.stdout
  const actualError = this.lastRun.error
  const actualStderr = this.lastRun.stderr

  if (actualOutput.match(expectedOutput)) {
    return callback()
  }

  if (actualError || actualStderr) {
    return callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
  }
})

Then('it fails with like:', function (expectedOutput, callback) {
  const actualOutput = this.lastRun.stdout
  const actualError = this.lastRun.error
  const actualStderr = this.lastRun.stderr

  if (actualOutput.match(new RegExp(expectedOutput))) {
    return callback()
  }

  if (actualError || actualStderr) {
    callback(new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + actualOutput))
  }
})

Then(/^The (server|stopper) is dead(:? with exit code (\d+))?$/, function (stopperOrServer, code, callback) {
  const server = stopperOrServer === 'server'
  setTimeout(() => {
    const actualExitCode = server ? this.backgroundProcess.handle.exitCode : this.stopperExitCode
    if (actualExitCode === undefined) return callback(new Error('Server has not exited.'))
    if (code === undefined || parseInt(code, 10) === actualExitCode) return callback()
    callback(new Error('Exit-code mismatch'))
  }, 4000)
})

Then(/^the file at ([a-zA-Z0-9/\\_.]+) contains:$/, function (filePath, expectedOutput) {
  const data = fs.readFileSync(path.join(this.workDir, filePath), 'utf8')
  if (!data.match(expectedOutput)) {
    throw new Error('Expected output to match the following:\n  ' + expectedOutput + '\nGot:\n  ' + data)
  }
})
