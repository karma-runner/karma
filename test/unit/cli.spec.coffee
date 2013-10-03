#==============================================================================
# lib/cli.js module
#==============================================================================
describe 'cli', ->
  cli = require '../../lib/cli'
  optimist = require 'optimist'
  path = require 'path'
  constant = require '../../lib/constants'
  path = require 'path'
  mocks = require 'mocks'

  fsMock = mocks.fs.create
    cwd:
      'karma.conf.js': true
    cwd2:
      'karma.conf.coffee': true

  currentCwd = null

  pathMock =
    resolve: (p) -> path.resolve currentCwd, p

  setCWD = (cwd) ->
    currentCwd = cwd
    fsMock._setCWD cwd

  processArgs = (args, opts) ->
    argv = optimist.parse(args)
    cli.processArgs argv, opts || {}, fsMock, pathMock

  beforeEach -> setCWD '/'

  describe 'processArgs', ->

    it 'should return camelCased options', ->
      options = processArgs ['some.conf', '--port', '12', '--single-run']

      expect(options.configFile).to.exist
      expect(options.port).to.equal 12
      expect(options.singleRun).to.equal  true


    it 'should parse options without configFile and set default', ->
      setCWD '/cwd'
      options = processArgs ['--auto-watch', '--auto-watch-interval', '10']

      expect(options.configFile).to.equal '/cwd/karma.conf.js'
      expect(options.autoWatch).to.equal  true
      expect(options.autoWatchInterval).to.equal 10


    it 'should set default karma.conf.coffee config file if exists', ->
      setCWD '/cwd2'
      options = processArgs ['--port', '10']

      expect(options.configFile).to.equal '/cwd2/karma.conf.coffee'


    it 'should not set default config if neither exists', ->
      setCWD '/'
      options = processArgs []

      expect(options.configFile).to.equal null


    it 'should parse auto-watch, colors, singleRun to boolean', ->
      options = processArgs ['--auto-watch', 'false', '--colors', 'false', '--single-run', 'false']

      expect(options.autoWatch).to.equal  false
      expect(options.colors).to.equal  false
      expect(options.singleRun).to.equal  false

      options = processArgs ['--auto-watch', 'true', '--colors', 'true', '--single-run', 'true']

      expect(options.autoWatch).to.equal  true
      expect(options.colors).to.equal  true
      expect(options.singleRun).to.equal  true


    it 'should replace log-level constants', ->
      options = processArgs ['--log-level', 'debug']
      expect(options.logLevel).to.equal constant.LOG_DEBUG

      options = processArgs ['--log-level', 'error']
      expect(options.logLevel).to.equal constant.LOG_ERROR

      options = processArgs ['--log-level', 'warn']
      expect(options.logLevel).to.equal constant.LOG_WARN


    it 'should parse browsers into an array', ->
      options = processArgs ['--browsers', 'Chrome,ChromeCanary,Firefox']
      expect(options.browsers).to.deep.equal ['Chrome', 'ChromeCanary', 'Firefox']


    it 'should resolve configFile to absolute path', ->
      setCWD '/cwd'
      options = processArgs ['some/config.js']
      expect(options.configFile).to.equal '/cwd/some/config.js'


    it 'should parse report-slower-than to a number', ->
      options = processArgs ['--report-slower-than', '2000']
      expect(options.reportSlowerThan).to.equal 2000

      options = processArgs ['--no-report-slower-than']
      expect(options.reportSlowerThan).to.equal 0


    it 'should cast reporters to array', ->
      options = processArgs ['--reporters', 'dots,junit']
      expect(options.reporters).to.deep.equal ['dots', 'junit']

      options = processArgs ['--reporters', 'dots']
      expect(options.reporters).to.deep.equal ['dots']


    it 'should parse removed/added/changed files to array', ->
      options = processArgs [
        '--removed-files', 'r1.js,r2.js',
        '--changed-files', 'ch1.js,ch2.js',
        '--added-files', 'a1.js,a2.js'
      ]

      expect(options.removedFiles).to.deep.equal ['r1.js', 'r2.js']
      expect(options.addedFiles).to.deep.equal ['a1.js', 'a2.js']
      expect(options.changedFiles).to.deep.equal ['ch1.js', 'ch2.js']


  describe 'parseClientArgs', ->
    it 'should return arguments after --', ->
      args = cli.parseClientArgs ['node', 'karma.js', 'runArg', '--flag', '--', '--foo', '--bar',
                                  'baz']
      expect(args).to.deep.equal ['--foo', '--bar', 'baz']

    it 'should return empty args if -- is not present', ->
      args = cli.parseClientArgs ['node', 'karma.js', 'runArg', '--flag', '--foo', '--bar', 'baz']
      expect(args).to.deep.equal []


  describe 'argsBeforeDoubleDash', ->
    it 'should return array of args that occur before --', ->
      args = cli.argsBeforeDoubleDash ['aa', '--bb', 'value', '--', 'some', '--no-more']
      expect(args).to.deep.equal ['aa', '--bb', 'value']
