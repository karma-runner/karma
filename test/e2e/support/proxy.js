var http = require('http')
var httpProxy = require('http-proxy')

var Proxy = function () {
  var self = this
  self.running = false

  self.proxy = httpProxy.createProxyServer({
    target: 'http://localhost:9876'
  })

  self.server = http.createServer(function (req, res) {
    var url = req.url
    var match = url.match(self.proxyPathRegExp)
    if (match) {
      req.url = '/' + match[1]
      self.proxy.web(req, res)
    } else {
      res.statusCode = 404
      res.statusMessage = 'Not found'
      res.end()
    }
  })

  self.start = function (port, proxyPath, callback) {
    self.proxyPathRegExp = new RegExp('^' + proxyPath + '(.*)')
    self.server.listen(port, function (error) {
      self.running = !error
      callback(error)
    })
  }

  self.stop = function (callback) {
    if (self.running) {
      self.running = false
      self.server.close(callback)
    } else {
      callback()
    }
  }
}

module.exports = new Proxy()
