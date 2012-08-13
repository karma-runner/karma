var url = require('url');

var parseProxyConfig = function(proxies) {
  var proxyConfig = {};
  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  if (proxies) {
    var proxiesList = Object.keys(proxies) || [];
    for (var i = 0; i< proxiesList.length; i++) {
      var proxyPath = proxiesList[i];
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
    }
  }
  return proxyConfig;
};

exports.parseProxyConfig = parseProxyConfig;

/**
 * Returns a handler which understands the proxies and its redirects, along with the proxy to use
 * @param proxy A http-proxy.RoutingProxy object with the proxyRequest method
 * @param proxies a map of routes to proxy url
 * @return {Function} handler function
 */
var createProxyHandler = function(proxy, proxies) {
  var proxiesList = [];
  if (proxies) {
    proxiesList = Object.keys(proxies);
    proxiesList.sort();
    proxiesList.reverse();
  }
  return function(request, response) {
    var proxiedUrl;
    if (proxies) {
      for (var i = 0; i < proxiesList.length; i++) {
        if (request.url.indexOf(proxiesList[i]) === 0) {
          proxiedUrl = proxies[proxiesList[i]];
          request.url = request.url.replace(proxiesList[i], proxiedUrl.baseProxyUrl);
          break;
        }
      }
    }
    if (proxiedUrl) {
      proxy.proxyRequest(request, response, {host: proxiedUrl.host, port: proxiedUrl.port});
      return true;
    }
    return false;
  };
};
exports.createProxyHandler = createProxyHandler;
