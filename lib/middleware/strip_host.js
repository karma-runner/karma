/**
 * Strip host middleware is responsible for stripping hostname from request path
 * This to handle requests that uses (normally over proxies) an absolutURI as request path
 */

var createStripHostMiddleware =  function(filesPromise, serveFile,
    /* config.basePath */ basePath) {

  return function(request, response, next) {
    function stripHostFromUrl(url) {
      return url.replace(/^http[s]?:\/\/([a-z\-\.\:\d]+)\//, '/');
    }

    request.url = request.bareUrl = stripHostFromUrl(request.url) || request.url;
    next();
  }
};

// PUBLIC API
exports.create = createStripHostMiddleware;
