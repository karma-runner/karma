function httpGet (url) {
  var xmlHttp = new XMLHttpRequest()

  xmlHttp.open('GET', url, false)
  xmlHttp.send(null)

  return xmlHttp
}

describe('setting custom headers', function () {
  it('should get custom headers', function () {
    expect(httpGet('/base/headers/foo.js').getResponseHeader('Custom-Header-Awesomeness')).toBe('there.is.no.dana.only.zuul')
  })
})
