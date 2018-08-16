describe('middleware.strip_host', function () {
  const stripHost = require('../../../lib/middleware/strip_host').stripHost

  it('should strip request with IP number', function () {
    const normalizedUrl = stripHost('http://192.12.31.100/base/a.js?123345')
    expect(normalizedUrl).to.equal('/base/a.js?123345')
  })

  it('should strip request with absoluteURI', function () {
    const normalizedUrl = stripHost('http://localhost/base/a.js?123345')
    expect(normalizedUrl).to.equal('/base/a.js?123345')
  })

  it('should strip request with absoluteURI and port', function () {
    const normalizedUrl = stripHost('http://localhost:9876/base/a.js?123345')
    expect(normalizedUrl).to.equal('/base/a.js?123345')
  })

  it('should strip request with absoluteURI over HTTPS', function () {
    const normalizedUrl = stripHost('https://karma-runner.github.io/base/a.js?123345')
    expect(normalizedUrl).to.equal('/base/a.js?123345')
  })

  it('should return same url as passed one', function () {
    const normalizedUrl = stripHost('/base/b.js?123345')
    expect(normalizedUrl).to.equal('/base/b.js?123345')
  })
})
