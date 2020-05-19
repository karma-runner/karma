const { defineParameterType, Given, Then, When } = require('cucumber')
const fs = require('fs')
const path = require('path')
const { waitForCondition } = require('./utils')
const stopper = require('../../../lib/stopper')

Given('a default configuration', function () {
  this.writeConfigFile()
})

Given('a configuration with:', function (fileContent) {
  this.updateConfig(fileContent)
  this.writeConfigFile()
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
  await waitForCondition(
    () => this.backgroundProcess.stdout.includes(expectedOutput),
    5000,
    () => new Error(
      'Expected server output to contain the above text within 5000ms, but got:\n\n' +
      this.backgroundProcess.stdout
    )
  )
})

defineParameterType({
  name: 'command',
  regexp: /run|start|init|stop/
})

When('I {command} Karma', async function (command) {
  await this.runForegroundProcess(`${command} ${this.configFile}`)
})

When('I {command} Karma with additional arguments: {string}', async function (command, args) {
  await this.runForegroundProcess(`${command} ${this.configFile} ${args}`)
})

When('I execute Karma with arguments: {string}', async function (args) {
  await this.runForegroundProcess(args)
})

Then(/^it passes with(:? (like|regexp))?:$/, { timeout: 10 * 1000 }, function (mode, expectedOutput, callback) {
  const like = mode === 'like'
  const regexp = mode === 'regexp'
  const actualOutput = this.lastRun.stdout

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

Then(/^the (stdout|stderr) (is exactly|contains|matches RegExp):$/, function (outputType, comparison, expectedOutput) {
  const actualOutput = (outputType === 'stdout' ? this.lastRun.stdout : this.lastRun.stderr).trim()
  expectedOutput = expectedOutput.trim()

  switch (comparison) {
    case 'is exactly':
      if (actualOutput !== expectedOutput) {
        throw new Error(`Expected output to be exactly as above, but got:\n\n${actualOutput}`)
      }
      break
    case 'contains':
      if (!actualOutput.includes(expectedOutput)) {
        throw new Error(`Expected output to contain the above text, but got:\n\n${actualOutput}`)
      }
      break
    case 'matches RegExp':
      if (!(new RegExp(expectedOutput).test(actualOutput))) {
        throw new Error(`Expected output to match the above RegExp, but got:\n\n${actualOutput}`)
      }
      break
    default:
      throw new Error(`Unknown comparison type: ${comparison}`)
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
