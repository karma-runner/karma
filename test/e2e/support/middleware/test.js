function httpGet (url) {
  var xmlHttp = new XMLHttpRequest()

  xmlHttp.open('GET', url, false)
  xmlHttp.send(null)

  return xmlHttp.responseText
}

describe('foo', function () {
  it('should should serve /foo.js', function () {
    expect(httpGet('/foo.js')).toBe('this is the middleware response')
  })
})
