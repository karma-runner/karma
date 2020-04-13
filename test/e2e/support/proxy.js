const http = require('http')
const httpProxy = require('http-proxy')

function Proxy () {
  const self = this
  self.running = false

  self.proxy = httpProxy.createProxyServer({
    target: 'http://localhost:9876'
  })

  self.proxy.on('error', function proxyError (err, req, res) {
    console.log('support/proxy onerror', err)
  })

  self.server = http.createServer(function (req, res) {
    const url = req.url
    const match = url.match(self.proxyPathRegExp)
    if (match) {
      req.url = '/' + match[1]
      self.proxy.web(req, res)
    } else {
      res.statusCode = 404
      res.statusMessage = 'Not found'
      res.end()
    }
  })

  self.server.on('clientError', (err, socket) => {
    console.log('support/proxy clientError', err)
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
