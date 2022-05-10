const http = require('http')
const httpProxy = require('http-proxy')
const { promisify } = require('util')

module.exports = class Proxy {
  constructor () {
    this.running = false
    this.proxyPathRegExp = null

    this.proxy = httpProxy.createProxyServer({
      target: 'http://127.0.0.1:9876'
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

  async start (port, proxyPath) {
    this.proxyPathRegExp = new RegExp('^' + proxyPath + '(.*)')
    await promisify(this.server.listen.bind(this.server))(port)
    this.running = true
  }

  async stopIfRunning () {
    if (this.running) {
      this.running = false
      await promisify(this.server.close.bind(this.server))()
    }
  }
}
