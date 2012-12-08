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
      expect(m.parseExitCode new Buffer 'something\nfake' + EXIT0).to.equal 0


    it 'should null the exit code part of the buffer', ->
      buffer = new Buffer 'some' + EXIT0
      m.parseExitCode buffer

      expect(buffer.toString()).to.equal 'some\0\0\0\0\0\0'


    it 'should not touch buffer without exit code and return default', ->
      msg = 'some nice \n messgae {}'
      buffer = new Buffer msg
      code = m.parseExitCode buffer, 10

      expect(buffer.toString()).to.equal msg
      expect(code).to.equal 10


    it 'should not slice buffer if smaller than exit code msg', ->
      # regression
      fakeBuffer = {length: 1, slice: -> null}
      sinon.stub fakeBuffer, 'slice'

      code = m.parseExitCode fakeBuffer, 10
      expect(fakeBuffer.slice).not.to.have.been.called
