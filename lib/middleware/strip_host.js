/**
 * Strip hostname from request path
 * This to handle requests that uses (normally over proxies) an absoluteURI as request path
 */

function stripHostFromUrl (url) {
  return url.replace(/^https?:\/\/[a-z.:\d-]+\//, '/')
}

// PUBLIC API
exports.stripHost = stripHostFromUrl
