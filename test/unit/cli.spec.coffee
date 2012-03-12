#==============================================================================
# lib/cli.js module
#==============================================================================
describe 'cli', ->
  cli = require '../../lib/cli'

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


  it 'should parse auto-watch to boolean', ->
    options = cli.server ['node', 'testacular', '--auto-watch', 'false']
    expect(options.autoWatch).toBe false

    options = cli.server ['node', 'testacular', '--auto-watch', 'true']
    expect(options.autoWatch).toBe true

