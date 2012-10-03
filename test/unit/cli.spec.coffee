#==============================================================================
# lib/cli.js module
#==============================================================================
describe 'cli', ->
  cli = require '../../lib/cli'
  optimist = require 'optimist'
  constant = require '../../lib/constants'
  CWD = process.cwd()

  processArgs = (args) ->
    argv = optimist.parse(args)
    cli.processArgs argv, {}

  describe 'processArgs', ->

    it 'should return camelCased options', ->
      options = processArgs ['some.conf', '--port', '12', '--runner-port', '45', '--single-run']

      expect(options.configFile).toBeDefined()
      expect(options.port).toBe 12
      expect(options.runnerPort).toBe 45
      expect(options.singleRun).toBe true


    it 'should parse options without configFile and set default', ->
      options = processArgs ['--auto-watch', '--auto-watch-interval', '10']

      expect(options.configFile).toBe CWD + '/testacular.conf.js'
      expect(options.autoWatch).toBe true
      expect(options.autoWatchInterval).toBe 10


    it 'should parse auto-watch, colors, singleRun to boolean', ->
      options = processArgs ['--auto-watch', 'false', '--colors', 'false', '--single-run', 'false']

      expect(options.autoWatch).toBe false
      expect(options.colors).toBe false
      expect(options.singleRun).toBe false

      options = processArgs ['--auto-watch', 'true', '--colors', 'true', '--single-run', 'true']

      expect(options.autoWatch).toBe true
      expect(options.colors).toBe true
      expect(options.singleRun).toBe true


    it 'should replace log-level constants', ->
      options = processArgs ['--log-level', 'debug']
      expect(options.logLevel).toBe constant.LOG_DEBUG

      options = processArgs ['--log-level', 'error']
      expect(options.logLevel).toBe constant.LOG_ERROR

      options = processArgs ['--log-level', 'warn']
      expect(options.logLevel).toBe constant.LOG_WARN


    it 'should parse browsers into an array', ->
      options = processArgs ['--browsers', 'Chrome,ChromeCanary,Firefox']
      expect(options.browsers).toEqual ['Chrome', 'ChromeCanary', 'Firefox']


    it 'should resolve configFile to absolute path', ->
      options = processArgs ['some/config.js']
      expect(options.configFile).toBe CWD + '/some/config.js'


    it 'should parse report-slower-than to a number', ->
      options = processArgs ['--report-slower-than', '2000']
      expect(options.reportSlowerThan).toBe 2000

      options = processArgs ['--no-report-slower-than']
      expect(options.reportSlowerThan).toBe 0


    it 'should cast reporters to array', ->
      options = processArgs ['--reporters', 'dots,junit']
      expect(options.reporters).toEqual ['dots', 'junit']

      options = processArgs ['--reporters', 'dots']
      expect(options.reporters).toEqual ['dots']
