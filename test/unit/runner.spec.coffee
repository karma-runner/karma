#==============================================================================
# lib/runner.js module
#==============================================================================
describe 'runner', ->
  loadFile = require('mocks').loadFile
  constant = require '../../lib/constants'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/runner.js'

  #============================================================================
  # runner.parseExitCode
  #============================================================================
  describe 'parseExitCode', ->
    EXIT0 = constant.EXIT_CODE_0

    it 'should return 0 exit code if present in the buffer', ->
      expect(m.parseExitCode new Buffer 'something\nfake' + EXIT0).toBe 0


    it 'should null the exit code part of the buffer', ->
      buffer = new Buffer 'some' + EXIT0
      m.parseExitCode buffer

      expect(buffer.toString()).toBe 'some\000\000\000\000\000\000'


    it 'should not touch buffer without exit code and return default', ->
      msg = 'some nice \n messgae {}'
      buffer = new Buffer msg
      code = m.parseExitCode buffer, 10

      expect(buffer.toString()).toBe msg
      expect(code).toBe 10
