const url = require('url')
const { Agent: httpAgent } = require('http')
const { Agent: httpsAgent } = require('https')
const httpProxy = require('http-proxy')
const _ = require('lodash')

const log = require('../logger').create('proxy')

function parseProxyConfig (proxies, config) {
  proxies = proxies || []
  return _.sortBy(_.map(proxies, function (proxyConfiguration, proxyPath) {
    if (typeof proxyConfiguration === 'string') {
      proxyConfiguration = { target: proxyConfiguration }
    }
    let proxyUrl = proxyConfiguration.target
    // eslint-disable-next-line node/no-deprecated-api
    const proxyDetails = url.parse(proxyUrl)
    let pathname = proxyDetails.pathname

    if (proxyPath.endsWith('/') && !proxyUrl.endsWith('/')) {
      log.warn(`proxy "${proxyUrl}" normalized to "${proxyUrl}/"`)
      proxyUrl += '/'
      pathname += '/'
    }

    if (!proxyPath.endsWith('/') && proxyUrl.endsWith('/')) {
      log.warn(`proxy "${proxyPath}" normalized to "${proxyPath}/"`)
      proxyPath += '/'
    }

    if (pathname === '/' && !proxyUrl.endsWith('/')) {
      pathname = ''
    }

    const hostname = proxyDetails.hostname || config.hostname
    const protocol = proxyDetails.protocol || config.protocol
    const defaultPorts = {
      'http:': '80',
      'https:': '443'
    }
    const port = proxyDetails.port || defaultPorts[proxyDetails.protocol] || config.port
    const changeOrigin = proxyConfiguration.changeOrigin || false
    const Agent = protocol === 'https:' ? httpsAgent : httpAgent
    const agent = new Agent({ keepAlive: true })
    const proxy = httpProxy.createProxyServer({
      target: { host: hostname, port, protocol },
      xfwd: true,
      changeOrigin: changeOrigin,
      secure: config.proxyValidateSSL,
      agent
    })

    ;['proxyReq', 'proxyRes'].forEach(function (name) {
      const callback = proxyDetails[name] || config[name]
      if (callback) {
        proxy.on(name, callback)
      }
    })

    proxy.on('error', function proxyError (err, req, res) {
      if (err.code === 'ECONNRESET' && req.socket.destroyed) {
        log.debug(`failed to proxy ${req.url} (browser hung up the socket)`)
      } else {
        log.warn(`failed to proxy ${req.url} (${err.message})`)
      }

      res.destroy()
    })

    return { path: proxyPath, baseUrl: pathname, host: hostname, port, proxy, agent }
  }), 'path').reverse()
}

/**
 * Returns a handler which understands the proxies and its redirects, along with the proxy to use
 * @param proxies An array of proxy record objects
 * @param urlRoot The URL root that karma is mounted on
 * @return {Function} handler function
 */
function createProxyHandler (proxies, urlRoot) {
  if (!proxies.length) {
    const nullProxy = (request, response, next) => next()
    nullProxy.upgrade = () => {}
    return nullProxy
  }

  function createProxy (request, response, next) {
    const proxyRecord = proxies.find((p) => request.url.startsWith(p.path))
    if (proxyRecord) {
      log.debug(`proxying request - ${request.url} to ${proxyRecord.host}:${proxyRecord.port}`)
      request.url = request.url.replace(proxyRecord.path, proxyRecord.baseUrl)
      proxyRecord.proxy.web(request, response)
    } else {
      return next()
    }
  }

  createProxy.upgrade = function (request, socket, head) {
    // special-case karma's route to avoid upgrading it
    if (request.url.startsWith(urlRoot)) {
      log.debug(`NOT upgrading proxyWebSocketRequest ${request.url}`)
      return
    }

    const proxyRecord = proxies.find((p) => request.url.startsWith(p.path))
    if (proxyRecord) {
      log.debug(`upgrade proxyWebSocketRequest ${request.url} to ${proxyRecord.host}:${proxyRecord.port}`)
      request.url = request.url.replace(proxyRecord.path, proxyRecord.baseUrl)
      proxyRecord.proxy.ws(request, socket, head)
    }
  }

  return createProxy
}

exports.create = function (/* config */config, /* config.proxies */proxies, /* emitter */emitter) {
  const proxyRecords = parseProxyConfig(proxies, config)
  emitter.on('exit', (done) => {
    log.debug('Destroying proxy agents')
    proxyRecords.forEach((proxyRecord) => {
      proxyRecord.agent.destroy()
    })
    done()
  })
  return createProxyHandler(proxyRecords, config.urlRoot)
}
