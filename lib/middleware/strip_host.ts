/**
 * Strip host middleware is responsible for stripping hostname from request path
 * This to handle requests that uses (normally over proxies) an absoluteURI as request path
 */

export function create() {
  return (request, response, next) => {
    var stripHostFromUrl = (url) => url.replace(/^http[s]?:\/\/([a-z\-\.:\d]+)\//, '/')

    request.normalizedUrl = stripHostFromUrl(request.url) || request.url
    next()
  }
}
