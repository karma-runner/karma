var url = require('url'),
    log = require('./logger').create('proxy');

var parseProxyConfig = function(proxies) {
  var proxyConfig = {};
  var endsWith = function(str, suffix) {
    return str.substr(-suffix.length) === suffix;
  };

  if (!proxies) {
    return proxyConfig;
  }

  Object.keys(proxies).forEach(function(proxyPath) {
    var proxyUrl = proxies[proxyPath];
    if (!endsWith(proxyPath, '/')) {
      proxyPath = proxyPath + '/';
    }

    var proxyDetails = url.parse(proxyUrl);
    if (!endsWith(proxyDetails.path, '/')) {
      proxyDetails.path = proxyDetails.path + '/';
    }

    proxyConfig[proxyPath] = {
      host: proxyDetails.hostname,
      port: proxyDetails.port || '80',
      baseProxyUrl: proxyDetails.path
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
    return function() {
      return false;
    };
  }
  proxy.on('proxyError', function(err) {
    log.warn('Proxy Request failed - ' + err);
  });

  return function(request, response) {
    for (var i = 0; i < proxiesList.length; i++) {
      if (request.url.indexOf(proxiesList[i]) === 0) {
        var proxiedUrl = proxies[proxiesList[i]];
        log.debug('Proxying request - ' + request.url + ' to ' + proxiedUrl.host + ':' + proxiedUrl.port);
        request.url = request.url.replace(proxiesList[i], proxiedUrl.baseProxyUrl);
        proxy.proxyRequest(request, response, {host: proxiedUrl.host, port: proxiedUrl.port});
        return true;
      }
    }

    return false;
  };
};


exports.createProxyHandler = createProxyHandler;
