import {loadFile} from 'mocks'
import constant from '../../lib/constants'

describe('runner', () => {
  var m

  beforeEach(() => {
    m = loadFile(__dirname + '/../../lib/runner.js')
  })

  describe('parseExitCode', () => {
    var EXIT = constant.EXIT_CODE

    it('should return 0 exit code if present in the buffer', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}10`))).to.equal(0)
    })

    it('should null the exit code part of the buffer', () => {
      var buffer = new Buffer(`some${EXIT}01`)
      m.parseExitCode(buffer)

      expect(buffer.toString()).to.equal('some\0\0\0\0\0\0\0')
    })

    it('should not touch buffer without exit code and return default', () => {
      var msg = 'some nice \n messgae {}'
      var buffer = new Buffer(msg)
      var code = m.parseExitCode(buffer, 10)

      expect(buffer.toString()).to.equal(msg)
      expect(code).to.equal(10)
    })

    it('should not slice buffer if smaller than exit code msg', () => {
      // regression
      var fakeBuffer = {length: 1, slice: () => null}
      sinon.stub(fakeBuffer, 'slice')

      m.parseExitCode(fakeBuffer, 10)
      expect(fakeBuffer.slice).not.to.have.been.called
    })

    it('should parse any single digit exit code', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`))).to.equal(1)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}17`))).to.equal(7)
    })

    it('should return exit code 0 if failOnEmptyTestSuite is false and and non-empty int is 0', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`), undefined, false)).to.equal(0)
    })

    it('should return exit code if failOnEmptyTestSuite is true', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}00`), undefined, true)).to.equal(0)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`), undefined, true)).to.equal(1)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}07`), undefined, true)).to.equal(7)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}10`), undefined, true)).to.equal(0)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}11`), undefined, true)).to.equal(1)
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}17`), undefined, true)).to.equal(7)
    })
  })
})
