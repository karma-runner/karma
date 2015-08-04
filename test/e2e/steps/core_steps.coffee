coreSteps = ->
  fs = require 'fs'
  path = require 'path'
  {Buffer} = require 'buffer'
  cp = require 'child_process'
  {exec, spawn} = require 'child_process'
  util = require 'util'

  rimraf = require 'rimraf'

  # Load world
  @World = require('../support/world').World

  # Load after hooks
  require('../support/after_hooks').call this

  baseDir = fs.realpathSync(__dirname + '/../../..')
  tmpDir = path.join(baseDir, 'tmp', 'sandbox')
  tmpConfigFile = 'karma.conf.js'

  cleansingNeeded = true

  additionalArgs = []

  tmpPath = (path) -> path.join(tmpDir, path)

  cleanseIfNeeded = =>
    if cleansingNeeded
      try rimraf.sync tmpDir catch error
      cleansingNeeded = false

  @Given /^a configuration with:$/, (fileContent, callback) ->
    cleanseIfNeeded()
    @addConfigContent fileContent
    callback()

  @Given /^command line arguments of: "([^"]*)"$/, (args, callback) ->
    additionalArgs = args
    callback()

  @When /^I (run|start|init) Karma$/, (command, callback) ->
    @writeConfigFile tmpDir, tmpConfigFile, (err, hash) =>
      return callback.fail new Error(err) if err

      configFile = path.join tmpDir, hash + '.' + tmpConfigFile
      options =
        stdio: 'pipe'
        cwd: baseDir
        detached: false

      runtimePath = path.join baseDir, 'bin', 'karma'

      execKarma = (done) ->
        cmd  = "#{runtimePath} #{command} --log-level warn #{configFile} #{additionalArgs}"
        exec cmd, {cwd: baseDir}, done

      if command is 'run'
        @child = spawn "#{runtimePath}", ['start', '--log-level', 'warn', configFile]

        done = =>
          cleansingNeeded = true
          @child.kill()
          callback()

        @child.on 'error', (error) =>
          @lastRun.error = error
          done()

        @child.stderr.on 'data', (chunk) =>
          @lastRun.stderr += chunk.toString()

        @child.stdout.on 'data', (chunk) =>
          @lastRun.stdout += chunk.toString()

          cmd = "#{runtimePath} run #{configFile} #{additionalArgs}"
          setTimeout =>
            exec cmd, {cwd: baseDir}, (error, stdout) =>
              @lastRun.error = error if error
              done()
          , 1000
      else
        execKarma (error, stdout, stderr) =>
          @lastRun.error = error if error
          @lastRun.stdout = stdout
          @lastRun.stderr = stderr

          cleansingNeeded = true
          callback()



  @Then /^it passes with( no debug)?:$/, (noDebug, expectedOutput, callback) ->
    noDebug = noDebug is ' no debug'
    actualOutput = @lastRun.stdout.toString()
    actualError  = @lastRun.error
    actualStderr = @lastRun.stderr.toString()

    # Filter out debug lines
    if noDebug
      lines = actualOutput.split('\n').filter (line) -> not line.match /\[DEBUG\]/
      actualOutput = lines.join '\n'

    return callback() if actualOutput.indexOf(expectedOutput) is 0
    if actualError or actualStderr
      callback.fail new Error """
      Expected output to match the following:
        #{expectedOutput}
      Got:
        #{actualOutput}
      """

  @Then /^it fails with:$/, (expectedOutput, callback) ->
    actualOutput = @lastRun.stdout.toString()
    actualError  = @lastRun.error
    actualStderr = @lastRun.stderr.toString()

    return callback() if not not actualOutput.match(expectedOutput)
    if actualError or actualStderr
      callback.fail new Error """
      Expected output to match the following:
        #{expectedOutput}
      Got:
        #{actualOutput}
      """

  @Then /^it fails with like:$/, (expectedOutput, callback) ->
    actualOutput = @lastRun.stdout.toString()
    actualError  = @lastRun.error
    actualStderr = @lastRun.stderr.toString()

    return callback() if not not actualOutput.match new RegExp(expectedOutput)
    if actualError or actualStderr
      callback.fail new Error """
      Expected output to match the following:
        #{expectedOutput}
      Got:
        #{actualOutput}
      """

module.exports = coreSteps
