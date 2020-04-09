const http = require('http')
const httpProxy = require('http-proxy')

function Proxy () {
  const self = this
  self.running = false

  self.proxy = httpProxy.createProxyServer({
    target: 'http://localhost:9876'
  })

  self.proxy.on('error', function proxyError (err, req, res) {
    console.log('proxy on error', err)
  })

  self.server = http.createServer(function (req, res) {
    const url = req.url
    const match = url.match(self.proxyPathRegExp)
    // console.log('e2e/support/proxy req: ' + url)
    if (match) {
      console.log('e2e/support/proxy match' + match)
      req.url = '/' + match[1]
      self.proxy.web(req, res)
    } else {
      res.statusCode = 404
      res.statusMessage = 'Not found'
      res.end()
    }
  })

  self.server.on('clientError', (err, socket) => {
    console.log('clientError', err)
  })

  self.start = function (port, proxyPath, callback) {
    self.proxyPathRegExp = new RegExp('^' + proxyPath + '(.*)')
    self.server.listen(port, function (error) {
      console.log('e2e/support/proxy listen', error)
      self.running = !error
      callback(error)
    })
    console.log('e2e/support/proxy start')
  }

  self.stop = function (callback) {
    console.log('e2e/support/proxy stop')
    if (self.running) {
      console.log('e2e/support/proxy close')
      self.running = false
      self.server.close(callback)
    } else {
      callback()
    }
  }
}

module.exports = new Proxy()
