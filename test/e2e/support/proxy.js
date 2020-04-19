const http = require('http')
const httpProxy = require('http-proxy')

module.exports = class Proxy {
  constructor () {
    this.running = false

    this.proxy = httpProxy.createProxyServer({
      target: 'http://localhost:9876'
    })

    this.proxy.on('error', (err) => {
      console.log('support/proxy onerror', err)
    })

    this.server = http.createServer((req, res) => {
      const url = req.url
      const match = url.match(this.proxyPathRegExp)
      if (match) {
        req.url = '/' + match[1]
        this.proxy.web(req, res)
      } else {
        res.statusCode = 404
        res.statusMessage = 'Not found'
        res.end()
      }
    })

    this.server.on('clientError', (err) => {
      console.log('support/proxy clientError', err)
    })
  }

  start (port, proxyPath, callback) {
    this.proxyPathRegExp = new RegExp('^' + proxyPath + '(.*)')
    this.server.listen(port, (error) => {
      this.running = !error
      callback(error)
    })
  }

  stop (callback) {
    if (this.running) {
      this.running = false
      this.server.close(callback)
    } else {
      callback()
    }
  }
}
