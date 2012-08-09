var url = require('url');

/**
 * Returns a handler which understands the proxies and its redirects, along with the proxy to use
 * @param proxy A http-proxy.RoutingProxy object with the proxyRequest method
 * @param proxies a map of routes to proxy url
 * @return {Function} handler function
 */
var createProxyHandler = function(proxy, proxies) {
  var proxiesList = Object.keys(proxies || {}).sort().reverse();

  if (!proxiesList.length) {
    return function() {
      return false;
    };
  }

  return function(request, response) {
    for (var i = 0; i < proxiesList.length; i++) {
      if (request.url.indexOf(proxiesList[i]) === 0) {
        var proxiedUrl = url.parse(proxies[proxiesList[i]]);
        proxiedUrl.port = proxiedUrl.port || '80';
        proxy.proxyRequest(request, response, {host: proxiedUrl.hostname, port: proxiedUrl.port});
        return true;
      }
    }

    return false;
  };
};


exports.createProxyHandler = createProxyHandler;
