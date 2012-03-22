#==============================================================================
# lib/cli.js module
#==============================================================================
describe 'cli', ->
  cli = require '../../lib/cli'
  constant = require '../../lib/constants'

  describe 'server', ->

  it 'should return camelCased options', ->
    options = cli.server ['node', 'testacular', 'some.conf', '--port', '12', '--runner-port', '45']

    expect(options.configFile).toBe 'some.conf'
    expect(options.port).toBe 12
    expect(options.runnerPort).toBe 45

  it 'should parse options without configFile and set default', ->
    options = cli.server ['node', 'testacular', '--auto-watch', '--auto-watch-interval', '10']

    expect(options.configFile).toBe 'testacular.conf'
    expect(options.autoWatch).toBe true
    expect(options.autoWatchInterval).toBe 10


  it 'should parse auto-watch, colors to boolean', ->
    options = cli.server ['node', 'testacular', '--auto-watch', 'false', '--colors', 'false']
    expect(options.autoWatch).toBe false
    expect(options.colors).toBe false

    options = cli.server ['node', 'testacular', '--auto-watch', 'true', '--colors', 'true']
    expect(options.autoWatch).toBe true
    expect(options.colors).toBe true


  it 'should replace log-level constants', ->
    options = cli.server ['node', 'testacular', '--log-level', 'debug']
    expect(options.logLevel).toBe constant.LOG_DEBUG

    options = cli.server ['node', 'testacular', '--log-level', 'error']
    expect(options.logLevel).toBe constant.LOG_ERROR

    options = cli.server ['node', 'testacular', '--log-level', 'warn']
    expect(options.logLevel).toBe constant.LOG_WARN
