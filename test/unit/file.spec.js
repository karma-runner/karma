const File = require('../../lib/file')

describe('File', () => {
  describe('detectType', () => {
    it('should detect type from the file extension', () => {
      const file = new File('/path/to/file.js')
      expect(file.detectType()).to.equal('js')
    })

    it('should return empty string if file does not have an extension', () => {
      const file = new File('/path/to/file-without-extension')
      expect(file.detectType()).to.equal('')
    })
  })
})
