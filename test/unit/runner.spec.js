const loadFile = require('mocks').loadFile
const path = require('path')

const constant = require('../../lib/constants')

describe('runner', () => {
  let m

  beforeEach(() => {
    m = loadFile(path.join(__dirname, '/../../lib/runner.js'))
  })

  describe('parseExitCode', () => {
    const EXIT = constant.EXIT_CODE

    it('should return 0 exit code if present in the buffer', () => {
      const result = m.parseExitCode(Buffer.from(`something\nfake${EXIT}10`))
      expect(result.exitCode).to.equal(0)
    })

    it('should remove the exit code part of the returned buffer', () => {
      const buffer = Buffer.from(`some${EXIT}01`)
      const result = m.parseExitCode(buffer)

      expect(buffer.toString()).to.equal(`some${EXIT}01`)
      expect(result.buffer.toString()).to.equal('some')
    })

    it('should not touch buffer without exit code and return default', () => {
      const msg = 'some nice \n messgae {}'
      const buffer = Buffer.from(msg)
      const result = m.parseExitCode(buffer, 10)

      expect(result.buffer.toString()).to.equal(msg)
      expect(result.buffer).to.equal(buffer)
      expect(result.exitCode).to.equal(10)
    })

    it('should not slice buffer if smaller than exit code msg', () => {
      // regression
      const fakeBuffer = { length: 1, slice: () => null }
      sinon.stub(fakeBuffer, 'slice')

      m.parseExitCode(fakeBuffer, 10)
      expect(fakeBuffer.slice).not.to.have.been.called
    })

    it('should return same buffer if smaller than exit code msg', () => {
      // regression
      const fakeBuffer = { length: 1, slice: () => null }
      const result = m.parseExitCode(fakeBuffer, 10)
      expect(fakeBuffer).to.equal(result.buffer)
    })

    it('should parse any single digit exit code', () => {
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}01`)).exitCode).to.equal(1)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}17`)).exitCode).to.equal(7)
    })

    it('should return exit code 0 if failOnEmptyTestSuite is false and and non-empty int is 0', () => {
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}01`), undefined, false).exitCode).to.equal(0)
    })

    it('should return exit code if failOnEmptyTestSuite is true', () => {
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}00`), undefined, true).exitCode).to.equal(0)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}01`), undefined, true).exitCode).to.equal(1)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}07`), undefined, true).exitCode).to.equal(7)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}10`), undefined, true).exitCode).to.equal(0)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}11`), undefined, true).exitCode).to.equal(1)
      expect(m.parseExitCode(Buffer.from(`something\nfake${EXIT}17`), undefined, true).exitCode).to.equal(7)
    })
  })
})
