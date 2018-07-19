var mocks = require('mocks')

describe('middleware.strip_host', function () {
  var nextSpy
  var HttpRequestMock = mocks.http.ServerRequest

  var createStripHostMiddleware = require('../../../lib/middleware/strip_host').create

  var handler = nextSpy = null

  beforeEach(function () {
    nextSpy = sinon.spy()
    handler = createStripHostMiddleware(null, null, '/base/path')
    return handler
  })

  it('should strip request with IP number', function (done) {
    var request = new HttpRequestMock('http://192.12.31.100/base/a.js?123345')
    handler(request, null, nextSpy)

    expect(request.normalizedUrl).to.equal('/base/a.js?123345')
    expect(nextSpy).to.have.been.called
    return done()
  })

  it('should strip request with absoluteURI', function (done) {
    var request = new HttpRequestMock('http://localhost/base/a.js?123345')
    handler(request, null, nextSpy)

    expect(request.normalizedUrl).to.equal('/base/a.js?123345')
    expect(nextSpy).to.have.been.called
    return done()
  })

  it('should strip request with absoluteURI and port', function (done) {
    var request = new HttpRequestMock('http://localhost:9876/base/a.js?123345')
    handler(request, null, nextSpy)

    expect(request.normalizedUrl).to.equal('/base/a.js?123345')
    expect(nextSpy).to.have.been.called
    return done()
  })

  it('should strip request with absoluteURI over HTTPS', function (done) {
    var request = new HttpRequestMock('https://karma-runner.github.io/base/a.js?123345')
    handler(request, null, nextSpy)

    expect(request.normalizedUrl).to.equal('/base/a.js?123345')
    expect(nextSpy).to.have.been.called
    return done()
  })

  return it('should return same url as passed one', function (done) {
    var request = new HttpRequestMock('/base/b.js?123345')
    handler(request, null, nextSpy)

    expect(request.normalizedUrl).to.equal('/base/b.js?123345')
    expect(nextSpy).to.have.been.called
    return done()
  })
})
