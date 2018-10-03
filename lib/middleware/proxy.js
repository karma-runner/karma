const url = require('url')
const httpProxy = require('http-proxy')
const _ = require('lodash')

const log = require('../logger').create('proxy')

function parseProxyConfig (proxies, config) {
  function endsWithSlash (str) {
    return str.substr(-1) === '/'
  }

  if (!proxies) {
    return []
  }

  return _.sortBy(_.map(proxies, function (proxyConfiguration, proxyPath) {
    if (typeof proxyConfiguration === 'string') {
      proxyConfiguration = {target: proxyConfiguration}
    }
    let proxyUrl = proxyConfiguration.target
    const proxyDetails = url.parse(proxyUrl)
    let pathname = proxyDetails.pathname

    // normalize the proxies config
    // should we move this to lib/config.js ?
    if (endsWithSlash(proxyPath) && !endsWithSlash(proxyUrl)) {
      log.warn('proxy "%s" normalized to "%s"', proxyUrl, proxyUrl + '/')
      proxyUrl += '/'
      pathname += '/'
    }

    if (!endsWithSlash(proxyPath) && endsWithSlash(proxyUrl)) {
      log.warn('proxy "%s" normalized to "%s"', proxyPath, proxyPath + '/')
      proxyPath += '/'
    }

    if (pathname === '/' && !endsWithSlash(proxyUrl)) {
      pathname = ''
    }

    const hostname = proxyDetails.hostname || config.hostname
    const protocol = proxyDetails.protocol || config.protocol
    const https = proxyDetails.protocol === 'https:'
    let port
    if (proxyDetails.port) {
      port = proxyDetails.port
    } else if (proxyDetails.protocol) {
      port = proxyDetails.protocol === 'https:' ? '443' : '80'
    } else {
      port = config.port
    }
    const changeOrigin = 'changeOrigin' in proxyConfiguration ? proxyConfiguration.changeOrigin : false
    const proxy = httpProxy.createProxyServer({
      target: {
        host: hostname,
        port: port,
        https: https,
        protocol: protocol
      },
      xfwd: true,
      changeOrigin: changeOrigin,
      secure: config.proxyValidateSSL
    })

    ;['proxyReq', 'proxyRes'].forEach(function (name) {
      const callback = proxyDetails[name] || config[name]
      if (callback) {
        proxy.on(name, callback)
      }
    })

    proxy.on('error', function proxyError (err, req, res) {
      if (err.code === 'ECONNRESET' && req.socket.destroyed) {
        log.debug('failed to proxy %s (browser hung up the socket)', req.url)
      } else {
        log.warn('failed to proxy %s (%s)', req.url, err.message)
      }

      res.destroy()
    })

    return {
      path: proxyPath,
      baseUrl: pathname,
      host: hostname,
      port: port,
      https: https,
      proxy: proxy
    }
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
    const nullProxy = function (request, response, next) {
      return next()
    }
    nullProxy.upgrade = function upgradeNullProxy () {}
    return nullProxy
  }

  function createProxy (request, response, next) {
    const proxyRecord = _.find(proxies, function (p) {
      return request.url.indexOf(p.path) === 0
    })

    if (!proxyRecord) {
      return next()
    }

    log.debug('proxying request - %s to %s:%s', request.url, proxyRecord.host, proxyRecord.port)
    request.url = request.url.replace(proxyRecord.path, proxyRecord.baseUrl)
    proxyRecord.proxy.web(request, response)
  }

  createProxy.upgrade = function upgradeProxy (request, socket, head) {
    // special-case karma's route to avoid upgrading it
    if (request.url.indexOf(urlRoot) === 0) {
      log.debug('NOT upgrading proxyWebSocketRequest %s', request.url)
      return
    }

    const proxyRecord = _.find(proxies, function (p) {
      return request.url.indexOf(p.path) === 0
    })

    if (!proxyRecord) {
      return
    }

    log.debug('upgrade proxyWebSocketRequest %s to %s:%s',
      request.url, proxyRecord.host, proxyRecord.port)
    request.url = request.url.replace(proxyRecord.path, proxyRecord.baseUrl)
    proxyRecord.proxy.ws(request, socket, head)
  }

  return createProxy
}

exports.create = function (/* config */config, /* config.proxies */proxies) {
  return createProxyHandler(parseProxyConfig(proxies, config), config.urlRoot)
}
