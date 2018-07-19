var loadFile = require('mocks').loadFile
var path = require('path')

var constant = require('../../lib/constants')

describe('runner', () => {
  var m

  beforeEach(() => {
    m = loadFile(path.join(__dirname, '/../../lib/runner.js'))
  })

  describe('parseExitCode', () => {
    var EXIT = constant.EXIT_CODE

    it('should return 0 exit code if present in the buffer', () => {
      var result = m.parseExitCode(new Buffer(`something\nfake${EXIT}10`)) // eslint-disable-line node/no-deprecated-api
      expect(result.exitCode).to.equal(0)
    })

    it('should remove the exit code part of the returned buffer', () => {
      var buffer = new Buffer(`some${EXIT}01`) // eslint-disable-line node/no-deprecated-api
      var result = m.parseExitCode(buffer)

      expect(buffer.toString()).to.equal(`some${EXIT}01`)
      expect(result.buffer.toString()).to.equal('some')
    })

    it('should not touch buffer without exit code and return default', () => {
      var msg = 'some nice \n messgae {}'
      var buffer = new Buffer(msg) // eslint-disable-line node/no-deprecated-api
      var result = m.parseExitCode(buffer, 10)

      expect(result.buffer.toString()).to.equal(msg)
      expect(result.buffer).to.equal(buffer)
      expect(result.exitCode).to.equal(10)
    })

    it('should not slice buffer if smaller than exit code msg', () => {
      // regression
      var fakeBuffer = {length: 1, slice: () => null}
      sinon.stub(fakeBuffer, 'slice')

      m.parseExitCode(fakeBuffer, 10)
      expect(fakeBuffer.slice).not.to.have.been.called
    })

    it('should return same buffer if smaller than exit code msg', () => {
      // regression
      var fakeBuffer = {length: 1, slice: () => null}
      var result = m.parseExitCode(fakeBuffer, 10)
      expect(fakeBuffer).to.equal(result.buffer)
    })

    it('should parse any single digit exit code', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`)).exitCode).to.equal(1) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}17`)).exitCode).to.equal(7) // eslint-disable-line node/no-deprecated-api
    })

    it('should return exit code 0 if failOnEmptyTestSuite is false and and non-empty int is 0', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`), undefined, false).exitCode).to.equal(0) // eslint-disable-line node/no-deprecated-api
    })

    it('should return exit code if failOnEmptyTestSuite is true', () => {
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}00`), undefined, true).exitCode).to.equal(0) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}01`), undefined, true).exitCode).to.equal(1) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}07`), undefined, true).exitCode).to.equal(7) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}10`), undefined, true).exitCode).to.equal(0) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}11`), undefined, true).exitCode).to.equal(1) // eslint-disable-line node/no-deprecated-api
      expect(m.parseExitCode(new Buffer(`something\nfake${EXIT}17`), undefined, true).exitCode).to.equal(7) // eslint-disable-line node/no-deprecated-api
    })
  })
})
