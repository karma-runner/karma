const Url = require('../../lib/url')

describe('Url', () => {
  describe('detectType', () => {
    it('should detect type from the file extension in the path of the URL', () => {
      const file = new Url('https://example.com/path/to/file.js')
      expect(file.detectType()).to.equal('js')
    })

    it('should detect type for URL with query params', () => {
      const file = new Url('https://example.com/path/to/file.js?query=simple')
      expect(file.detectType()).to.equal('js')
    })

    it('should detect type for URL with a fragment', () => {
      const file = new Url('https://example.com/path/to/file.js#fragment')
      expect(file.detectType()).to.equal('js')
    })

    it('should return empty string if URL does not have path', () => {
      const file = new Url('https://example.com')
      expect(file.detectType()).to.equal('')
    })

    it('should return empty string if path in the URL does not have an extension', () => {
      const file = new Url('https://example.com/path/to/file-without-extension')
      expect(file.detectType()).to.equal('')
    })
  })
})
