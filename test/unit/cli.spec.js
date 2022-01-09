'use strict'

const path = require('path')
const mocks = require('mocks')
const proxyquire = require('proxyquire')

const cli = require('../../lib/cli')
const constant = require('../../lib/constants')

const loadFile = mocks.loadFile

describe('cli', () => {
  let m
  let e
  let mockery

  const fsMock = mocks.fs.create({
    cwd: { 'karma.conf.js': true },
    cwd2: { 'karma.conf.coffee': true },
    cwd3: { 'karma.conf.ts': true }
  })

  let currentCwd = null

  const pathMock = {
    resolve (p) {
      return path.resolve(currentCwd, p)
    }
  }

  const setCWD = (cwd) => {
    currentCwd = cwd
    fsMock._setCWD(cwd)
  }

  const processArgs = (args, opts) => {
    const argv = m.describeRoot().parse(args)
    return e.processArgs(argv, opts || {}, fsMock, pathMock)
  }

  beforeEach(() => {
    setCWD('/')
    mockery = {}
    mockery.process = { exit: sinon.spy() }
    mockery.console = { error: sinon.spy() }

    // load file under test
    m = loadFile(path.join(__dirname, '/../../lib/cli.js'), mockery, {
      global: {},
      console: mockery.console,
      process: mockery.process,
      require (path) {
        if (path.indexOf('./') === 0) {
          return require('../../lib/' + path)
        } else {
          return require(path)
        }
      }
    })
    e = m.exports
  })

  describe('processArgs', () => {
    it('should override if multiple options given', () => {
      // yargs parses --port 123 --port 456 as port = [123, 456] which makes no sense
      const options = processArgs(['start', 'some.conf', '--port', '12', '--log-level', 'info', '--port', '34', '--log-level', 'debug'])

      expect(options.port).to.equal(34)
      expect(options.logLevel).to.equal('DEBUG')
    })

    it('should return camelCased options', () => {
      const options = processArgs(['start', 'some.conf', '--port', '12', '--single-run'])

      expect(options.configFile).to.exist
      expect(options.port).to.equal(12)
      expect(options.singleRun).to.equal(true)
    })

    it('should parse options without configFile and set default', () => {
      setCWD('/cwd')
      const options = processArgs(['start', '--auto-watch'])
      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd/karma.conf.js'))
      expect(options.autoWatch).to.equal(true)
    })

    it('should set default karma.conf.coffee config file if exists', () => {
      setCWD('/cwd2')
      const options = processArgs(['start', '--port', '10'])

      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd2/karma.conf.coffee'))
    })

    it('should set default karma.conf.ts config file if exists', () => {
      setCWD('/cwd3')
      const options = processArgs(['start', '--port', '10'])

      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd3/karma.conf.ts'))
    })

    it('should not set default config if neither exists', () => {
      setCWD('/')
      const options = processArgs(['start'])

      expect(options.configFile).to.equal(null)
    })

    it('should parse auto-watch, colors, singleRun to boolean', () => {
      let options = processArgs(['start', '--auto-watch', 'false', '--colors', 'false', '--single-run', 'false'])

      expect(options.autoWatch).to.equal(false)
      expect(options.colors).to.equal(false)
      expect(options.singleRun).to.equal(false)

      options = processArgs(['start', '--auto-watch', 'true', '--colors', 'true', '--single-run', 'true'])

      expect(options.autoWatch).to.equal(true)
      expect(options.colors).to.equal(true)
      expect(options.singleRun).to.equal(true)
    })

    it('should replace log-level constants', () => {
      let options = processArgs(['start', '--log-level', 'debug'])
      expect(options.logLevel).to.equal(constant.LOG_DEBUG)

      options = processArgs(['start', '--log-level', 'error'])
      expect(options.logLevel).to.equal(constant.LOG_ERROR)

      options = processArgs(['start', '--log-level', 'warn'])
      expect(options.logLevel).to.equal(constant.LOG_WARN)

      options = processArgs(['start', '--log-level', 'foo'])
      expect(mockery.process.exit).to.have.been.calledWith(1)

      options = processArgs(['start', '--log-level'])
      expect(mockery.process.exit).to.have.been.calledWith(1)
    })

    it('should parse format-error into a function', () => {
      // root export
      let options = processArgs(['start', '--format-error', '../../test/unit/fixtures/format-error-root'])
      const formatErrorRoot = require('../../test/unit/fixtures/format-error-root')
      expect(options.formatError).to.equal(formatErrorRoot)

      // property export
      options = processArgs(['start', '--format-error', '../../test/unit/fixtures/format-error-property'])
      const formatErrorProperty = require('../../test/unit/fixtures/format-error-property').formatError
      expect(options.formatError).to.equal(formatErrorProperty)
    })

    it('should parse browsers into an array', () => {
      const options = processArgs(['start', '--browsers', 'Chrome,ChromeCanary,Firefox'])
      expect(options.browsers).to.deep.equal(['Chrome', 'ChromeCanary', 'Firefox'])
    })

    it('should resolve configFile to absolute path', () => {
      setCWD('/cwd')
      const options = processArgs(['start', 'some/config.js'])
      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd/some/config.js'))
    })

    it('should parse report-slower-than to a number', () => {
      let options = processArgs(['start', '--report-slower-than', '2000'])
      expect(options.reportSlowerThan).to.equal(2000)

      options = processArgs(['start', '--no-report-slower-than'])
      expect(options.reportSlowerThan).to.equal(0)
    })

    it('should cast reporters to array', () => {
      let options = processArgs(['start', '--reporters', 'dots,junit'])
      expect(options.reporters).to.deep.equal(['dots', 'junit'])

      options = processArgs(['start', '--reporters', 'dots'])
      expect(options.reporters).to.deep.equal(['dots'])
    })

    it('should parse removed/added/changed files to array', () => {
      const options = processArgs([
        'run',
        '--removed-files', 'r1.js,r2.js',
        '--changed-files', 'ch1.js,ch2.js',
        '--added-files', 'a1.js,a2.js'
      ])

      expect(options.removedFiles).to.deep.equal(['r1.js', 'r2.js'])
      expect(options.addedFiles).to.deep.equal(['a1.js', 'a2.js'])
      expect(options.changedFiles).to.deep.equal(['ch1.js', 'ch2.js'])
    })
  })

  describe('parseClientArgs', () => {
    it('should return arguments after --', () => {
      const args = cli.parseClientArgs(['node', 'karma.js', 'runArg', '--flag', '--', '--foo', '--bar', 'baz'])
      expect(args).to.deep.equal(['--foo', '--bar', 'baz'])
    })

    it('should return empty args if -- is not present', () => {
      const args = cli.parseClientArgs(['node', 'karma.js', 'runArg', '--flag', '--foo', '--bar', 'baz'])
      expect(args).to.deep.equal([])
    })
  })

  describe('argsBeforeDoubleDash', () => {
    it('should return array of args that occur before --', () => {
      const args = cli.argsBeforeDoubleDash(['aa', '--bb', 'value', '--', 'some', '--no-more'])
      expect(args).to.deep.equal(['aa', '--bb', 'value'])
    })
  })

  describe('run', () => {
    const COMMAND_COMPLETION = 'completion'
    const COMMAND_INIT = 'init'
    const COMMAND_RUN = 'run'
    const COMMAND_START = 'start'
    const COMMAND_STOP = 'stop'
    const consoleErrorOriginal = console.error
    const processExitOriginal = process.exit
    let cliModule
    let cliProcessFake = null
    let completionFake = null
    let initFake = null
    let parseConfigFake = null
    let runEmitterFake = null
    let runFake = null
    let ServerFake = null
    let serverStartFake = null
    let stopFake = null
    let testCommand = null
    let forceConfigFailure = false

    // `cliProcessFake` is used in multiple scopes, but not needed by the top
    // scope. By using a factory, we can maintain one copy of the code in a
    // single location while still having access to scopped variables that we
    // need.
    function createCliProcessFake () {
      return sinon.fake(function cliProcessFake () {
        const cliOptions = {}
        if (
          testCommand === COMMAND_COMPLETION ||
          testCommand === COMMAND_INIT ||
          testCommand === COMMAND_RUN ||
          testCommand === COMMAND_START ||
          testCommand === COMMAND_STOP
        ) {
          cliOptions.cmd = testCommand
        } else {
          const errorMessage =
          'cli.spec.js: A valid command must be provided when testing the' +
          'exported `run()` method.'
          throw new Error(errorMessage)
        }
        if (forceConfigFailure === true) {
          cliOptions.forceConfigFailure = true
        }
        return cliOptions
      })
    }

    before(() => {
      proxyquire.noPreserveCache()
    })

    beforeEach(() => {
      // Keep the test output clean
      console.error = sinon.spy()

      // Keep the process from actually exiting
      process.exit = sinon.spy()

      completionFake = sinon.fake()
      initFake = sinon.fake()
      parseConfigFake = sinon.fake(function parseConfigFake () {
        const cliOptions = arguments[1]

        // Allow individual tests to test against success and failure without
        // needing to manage multiple sinon fakes.
        const forceConfigFailure = cliOptions && cliOptions.forceConfigFailure === true
        if (forceConfigFailure) {
          // No need to mock out the synchronous API, the CLI is not intended to
          // use it
          return Promise.reject(new Error('Intentional Failure For Testing'))
        }

        // Most of our tests will ignore the actual config as the CLI passes it
        // on to other methods that are tested elsewhere
        const karmaConfig = {
          ...cliOptions,
          isFakeParsedConfig: true
        }
        return Promise.resolve(karmaConfig)
      })
      runEmitterFake = {}
      runEmitterFake.on = sinon.fake.returns(runEmitterFake)
      runFake = sinon.fake.returns(runEmitterFake)
      serverStartFake = sinon.fake.resolves()
      ServerFake = sinon.fake.returns({ start: serverStartFake })
      stopFake = sinon.fake()
      cliModule = proxyquire(
        '../../lib/cli',
        {
          './completion': {
            completion: completionFake
          },
          './config': {
            parseConfig: parseConfigFake
          },
          './init': {
            init: initFake
          },
          './runner': {
            run: runFake
          },
          './server': ServerFake,
          './stopper': {
            stop: stopFake
          }
        }
      )
    })

    afterEach(() => {
      // Restore globals, simultaneously removing references to the spies.
      console.error = consoleErrorOriginal
      process.exit = processExitOriginal

      // Reset the test command
      testCommand = null

      // Most tests won't be testing what happens during a configuration failure
      // Here we clean up after the ones that do.
      forceConfigFailure = false

      // Restores all replaced properties set by sinon methods (`replace`,
      // `spy`, and `stub`)
      sinon.restore()

      // Remove references to Fakes that were not handled above. Avoids `before`
      // and `beforeEach` aside effects and references not getting cleaned up
      // after the last test.
      cliModule = null
      cliProcessFake = null
      completionFake = null
      initFake = null
      parseConfigFake = null
      runEmitterFake = null
      runFake = null
      ServerFake = null
      serverStartFake = null
      stopFake = null
    })

    after(() => {
      proxyquire.preserveCache()
    })

    describe('commands', () => {
      let cliProcessOriginal
      beforeEach(() => {
        cliProcessFake = createCliProcessFake()
        cliProcessOriginal = cliModule.process
        cliModule.process = cliProcessFake
      })
      afterEach(() => {
        if (cliModule) {
          cliModule.process = cliProcessOriginal
        }
      })
      describe(COMMAND_COMPLETION, () => {
        beforeEach(() => {
          testCommand = COMMAND_COMPLETION
        })
        it('should configure and call the completion method of the completion module', async () => {
          await cliModule.run()
          expect(completionFake.calledOnce).to.be.true
          expect(completionFake.firstCall.args[0]).to.eql({
            cmd: COMMAND_COMPLETION
          })
        })
      })
      describe(COMMAND_INIT, () => {
        beforeEach(() => {
          testCommand = COMMAND_INIT
        })
        it('should configure and call the init method of the init module', async () => {
          await cliModule.run()
          expect(initFake.calledOnce).to.be.true
          expect(initFake.firstCall.args[0]).to.eql({
            cmd: COMMAND_INIT
          })
        })
      })
      describe(COMMAND_RUN, () => {
        beforeEach(() => {
          testCommand = COMMAND_RUN
        })
        it('should configure and call the run method of the runner module', async () => {
          await cliModule.run()
          expect(runFake.calledOnce).to.be.true
          expect(runFake.firstCall.args[0]).to.eql({
            cmd: COMMAND_RUN,
            isFakeParsedConfig: true
          })
          expect(runEmitterFake.on.calledOnce).to.be.true
          expect(runEmitterFake.on.firstCall.args[0]).to.be.equal('progress')
        })
      })
      describe(COMMAND_START, () => {
        beforeEach(() => {
          testCommand = COMMAND_START
        })
        it('should configure and start the server', async () => {
          await cliModule.run()
          expect(ServerFake.calledOnce).to.be.true
          expect(ServerFake.firstCall.args[0]).to.eql({
            cmd: COMMAND_START,
            isFakeParsedConfig: true
          })
          expect(serverStartFake.calledOnce).to.be.true
        })
      })
      describe(COMMAND_STOP, () => {
        beforeEach(() => {
          testCommand = COMMAND_STOP
        })
        it('should configure and call the stop method of the stopper module', async () => {
          await cliModule.run()
          expect(stopFake.calledOnce).to.be.true
          expect(stopFake.firstCall.args[0]).to.eql({
            cmd: COMMAND_STOP,
            isFakeParsedConfig: true
          })
        })
      })
    })
    describe('configuration failure', () => {
      let cliProcessOriginal
      beforeEach(() => {
        forceConfigFailure = true
        testCommand = COMMAND_START

        cliProcessFake = createCliProcessFake()
        cliProcessOriginal = cliModule.process
        cliModule.process = cliProcessFake
      })
      afterEach(() => {
        if (cliModule) {
          cliModule.process = cliProcessOriginal
        }
      })
      it('should exit the process with a non-zero exit code when configuration parsing fails', async () => {
        await cliModule.run()
        expect(process.exit.calledOnce).to.be.true
        expect(process.exit.firstCall.args[0]).not.to.be.equal(0)
      })
    })
  })
})
