var url = require('url');

var log = require('./logger').create('proxy');


var parseProxyConfig = function(proxies) {
  var proxyConfig = {};
  var endsWithSlash = function(str) {
    return str.substr(-1) === '/';
  };

  if (!proxies) {
    return proxyConfig;
  }

  Object.keys(proxies).forEach(function(proxyPath) {
    var proxyUrl = proxies[proxyPath];
    var proxyDetails = url.parse(proxyUrl);
    var pathname = proxyDetails.pathname;

    // normalize the proxies config
    // should we move this to lib/config.js ?
    if (endsWithSlash(proxyPath) && !endsWithSlash(proxyUrl)) {
      log.warn('proxy "%s" normalized to "%s"', proxyUrl, proxyUrl + '/');
      proxyUrl += '/';
    }

    if (!endsWithSlash(proxyPath) && endsWithSlash(proxyUrl)) {
      log.warn('proxy "%s" normalized to "%s"', proxyPath, proxyPath + '/');
      proxyPath += '/';
    }

    if (pathname === '/'  && !endsWithSlash(proxyUrl)) {
      pathname = '';
    }

    proxyConfig[proxyPath] = {
      host: proxyDetails.hostname,
      port: proxyDetails.port || '80',
      baseProxyUrl: pathname
    };
  });

  return proxyConfig;
};


/**
 * Returns a handler which understands the proxies and its redirects, along with the proxy to use
 * @param proxy A http-proxy.RoutingProxy object with the proxyRequest method
 * @param proxies a map of routes to proxy url
 * @return {Function} handler function
 */
var createProxyHandler = function(proxy, proxyConfig) {
  var proxies = parseProxyConfig(proxyConfig);
  var proxiesList = Object.keys(proxies).sort().reverse();

  if (!proxiesList.length) {
    return function(request, response, next) {
      return next();
    };
  }
  proxy.on('proxyError', function(err, req, resp) {
    if (err.code === 'ECONNRESET' && req.socket.destroyed) {
      log.debug('failed to proxy %s (browser hang up the socket)', req.url);
    } else {
      log.warn('failed to proxy %s (%s)', req.url, err);
    }
  });

  return function(request, response, next) {
    for (var i = 0; i < proxiesList.length; i++) {
      if (request.url.indexOf(proxiesList[i]) === 0) {
        var proxiedUrl = proxies[proxiesList[i]];

        log.debug('Proxying request - ' + request.url + ' to ' + proxiedUrl.host + ':' + proxiedUrl.port);
        request.url = request.url.replace(proxiesList[i], proxiedUrl.baseProxyUrl);
        proxy.proxyRequest(request, response, {host: proxiedUrl.host, port: proxiedUrl.port});
        return;
      }
    }

    return next();
  };
};


exports.createProxyHandler = createProxyHandler;
