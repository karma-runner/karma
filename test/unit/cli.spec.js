'use strict'

const yargs = require('yargs')
const path = require('path')
const mocks = require('mocks')
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
    const argv = yargs.parse(args)
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
      //  yargs parses --port 123 --port 456 as port = [123, 456] which makes no sense
      const options = processArgs(['some.conf', '--port', '12', '--log-level', 'info', '--port', '34', '--log-level', 'debug'])

      expect(options.port).to.equal(34)
      expect(options.logLevel).to.equal('DEBUG')
    })

    it('should return camelCased options', () => {
      const options = processArgs(['some.conf', '--port', '12', '--single-run'])

      expect(options.configFile).to.exist
      expect(options.port).to.equal(12)
      expect(options.singleRun).to.equal(true)
    })

    it('should parse options without configFile and set default', () => {
      setCWD('/cwd')
      const options = processArgs(['--auto-watch', '--auto-watch-interval', '10'])
      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd/karma.conf.js'))
      expect(options.autoWatch).to.equal(true)
      expect(options.autoWatchInterval).to.equal(10)
    })

    it('should set default karma.conf.coffee config file if exists', () => {
      setCWD('/cwd2')
      const options = processArgs(['--port', '10'])

      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd2/karma.conf.coffee'))
    })

    it('should set default karma.conf.ts config file if exists', () => {
      setCWD('/cwd3')
      const options = processArgs(['--port', '10'])

      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd3/karma.conf.ts'))
    })

    it('should not set default config if neither exists', () => {
      setCWD('/')
      const options = processArgs([])

      expect(options.configFile).to.equal(null)
    })

    it('should parse auto-watch, colors, singleRun to boolean', () => {
      let options = processArgs(['--auto-watch', 'false', '--colors', 'false', '--single-run', 'false'])

      expect(options.autoWatch).to.equal(false)
      expect(options.colors).to.equal(false)
      expect(options.singleRun).to.equal(false)

      options = processArgs(['--auto-watch', 'true', '--colors', 'true', '--single-run', 'true'])

      expect(options.autoWatch).to.equal(true)
      expect(options.colors).to.equal(true)
      expect(options.singleRun).to.equal(true)
    })

    it('should replace log-level constants', () => {
      let options = processArgs(['--log-level', 'debug'])
      expect(options.logLevel).to.equal(constant.LOG_DEBUG)

      options = processArgs(['--log-level', 'error'])
      expect(options.logLevel).to.equal(constant.LOG_ERROR)

      options = processArgs(['--log-level', 'warn'])
      expect(options.logLevel).to.equal(constant.LOG_WARN)

      options = processArgs(['--log-level', 'foo'])
      expect(mockery.process.exit).to.have.been.calledWith(1)

      options = processArgs(['--log-level'])
      expect(mockery.process.exit).to.have.been.calledWith(1)
    })

    it('should parse format-error into a function', () => {
      // root export
      let options = processArgs(['--format-error', '../../test/unit/fixtures/format-error-root'])
      const formatErrorRoot = require('../../test/unit/fixtures/format-error-root')
      expect(options.formatError).to.equal(formatErrorRoot)

      // property export
      options = processArgs(['--format-error', '../../test/unit/fixtures/format-error-property'])
      const formatErrorProperty = require('../../test/unit/fixtures/format-error-property').formatError
      expect(options.formatError).to.equal(formatErrorProperty)
    })

    it('should parse browsers into an array', () => {
      const options = processArgs(['--browsers', 'Chrome,ChromeCanary,Firefox'])
      expect(options.browsers).to.deep.equal(['Chrome', 'ChromeCanary', 'Firefox'])
    })

    it('should resolve configFile to absolute path', () => {
      setCWD('/cwd')
      const options = processArgs(['some/config.js'])
      expect(path.resolve(options.configFile)).to.equal(path.resolve('/cwd/some/config.js'))
    })

    it('should parse report-slower-than to a number', () => {
      let options = processArgs(['--report-slower-than', '2000'])
      expect(options.reportSlowerThan).to.equal(2000)

      options = processArgs(['--no-report-slower-than'])
      expect(options.reportSlowerThan).to.equal(0)
    })

    it('should cast reporters to array', () => {
      let options = processArgs(['--reporters', 'dots,junit'])
      expect(options.reporters).to.deep.equal(['dots', 'junit'])

      options = processArgs(['--reporters', 'dots'])
      expect(options.reporters).to.deep.equal(['dots'])
    })

    it('should parse removed/added/changed files to array', () => {
      const options = processArgs([
        '--removed-files', 'r1.js,r2.js',
        '--changed-files', 'ch1.js,ch2.js',
        '--added-files', 'a1.js,a2.js'
      ])

      expect(options.removedFiles).to.deep.equal(['r1.js', 'r2.js'])
      expect(options.addedFiles).to.deep.equal(['a1.js', 'a2.js'])
      expect(options.changedFiles).to.deep.equal(['ch1.js', 'ch2.js'])
    })

    it('should error on args with underscores', () => {
      let expectedException
      try {
        const options = processArgs(['--no_browsers'])
        expectedException = 'Should have thrown but got ' + options
      } catch (e) {
        expectedException = e
      } finally {
        expect(expectedException + '').to.includes('Bad argument: no_browsers did you mean no-browsers')
      }
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
})
