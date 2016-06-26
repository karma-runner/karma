/**
 * Karma middleware is responsible for serving:
 * - client.html (the entrypoint for capturing a browser)
 * - debug.html
 * - context.html (the execution context, loaded within an iframe)
 * - karma.js
 *
 * The main part is generating context.html, as it contains:
 * - generating mappings
 * - including <script> and <link> tags
 * - setting propert caching headers
 */

var path = require('path')
var util = require('util')
var url = require('url')
var useragent = require('useragent')

var log = require('../logger').create('middleware:karma')

var urlparse = function (urlStr) {
  var urlObj = url.parse(urlStr, true)
  urlObj.query = urlObj.query || {}
  return urlObj
}

var common = require('./common')

var VERSION = require('../constants').VERSION
var SCRIPT_TAG = '<script type="%s" src="%s"></script>'
var LINK_TAG_CSS = '<link type="text/css" href="%s" rel="stylesheet">'
var LINK_TAG_HTML = '<link href="%s" rel="import">'
var SCRIPT_TYPE = {
  '.js': 'text/javascript',
  '.dart': 'application/dart'
}

var filePathToUrlPath = function (filePath, basePath, urlRoot) {
  if (filePath.indexOf(basePath) === 0) {
    return urlRoot + 'base' + filePath.substr(basePath.length)
  }

  return urlRoot + 'absolute' + filePath
}

var getXUACompatibleMetaElement = function (url) {
  var tag = ''
  var urlObj = urlparse(url)
  if (urlObj.query['x-ua-compatible']) {
    tag = '\n<meta http-equiv="X-UA-Compatible" content="' +
      urlObj.query['x-ua-compatible'] + '"/>'
  }
  return tag
}

var getXUACompatibleUrl = function (url) {
  var value = ''
  var urlObj = urlparse(url)
  if (urlObj.query['x-ua-compatible']) {
    value = '?x-ua-compatible=' + encodeURIComponent(urlObj.query['x-ua-compatible'])
  }
  return value
}

var isFirefox = function (req) {
  if (!(req && req.headers)) {
    return false
  }

  // Browser check
  var firefox = useragent.is(req.headers['user-agent']).firefox

  return firefox
}

var createKarmaMiddleware = function (
  filesPromise,
  serveStaticFile,
  serveFile,
  injector,
  basePath,
  urlRoot
) {
  return function (request, response, next) {
    // These config values should be up to date on every request
    var client = injector.get('config.client')
    var customContextFile = injector.get('config.customContextFile')
    var customDebugFile = injector.get('config.customDebugFile')
    var jsVersion = injector.get('config.jsVersion')

    var requestUrl = request.normalizedUrl.replace(/\?.*/, '')

    // redirect /__karma__ to /__karma__ (trailing slash)
    if (requestUrl === urlRoot.substr(0, urlRoot.length - 1)) {
      response.setHeader('Location', urlRoot)
      response.writeHead(301)
      return response.end('MOVED PERMANENTLY')
    }

    // ignore urls outside urlRoot
    if (requestUrl.indexOf(urlRoot) !== 0) {
      return next()
    }

    // remove urlRoot prefix
    requestUrl = requestUrl.substr(urlRoot.length - 1)

    // serve client.html
    if (requestUrl === '/') {
      return serveStaticFile('/client.html', response, function (data) {
        return data
          .replace('\n%X_UA_COMPATIBLE%', getXUACompatibleMetaElement(request.url))
          .replace('%X_UA_COMPATIBLE_URL%', getXUACompatibleUrl(request.url))
      })
    }

    // serve karma.js, context.js, and debug.js
    var jsFiles = ['/karma.js', '/context.js', '/debug.js']
    var isRequestingJsFile = jsFiles.indexOf(requestUrl) !== -1
    if (isRequestingJsFile) {
      return serveStaticFile(requestUrl, response, function (data) {
        return data.replace('%KARMA_URL_ROOT%', urlRoot)
          .replace('%KARMA_VERSION%', VERSION)
      })
    }

    // serve the favicon
    if (requestUrl === '/favicon.ico') {
      return serveStaticFile(requestUrl, response)
    }

    // serve context.html - execution context within the iframe
    // or debug.html - execution context without channel to the server
    var isRequestingContextFile = requestUrl === '/context.html'
    var isRequestingDebugFile = requestUrl === '/debug.html'
    if (isRequestingContextFile || isRequestingDebugFile) {
      return filesPromise.then(function (files) {
        var fileServer
        var requestedFileUrl
        log.debug('custom files', customContextFile, customDebugFile)
        if (isRequestingContextFile && customContextFile) {
          log.debug('Serving customContextFile %s', customContextFile)
          fileServer = serveFile
          requestedFileUrl = customContextFile
        } else if (isRequestingDebugFile && customDebugFile) {
          log.debug('Serving customDebugFile %s', customDebugFile)
          fileServer = serveFile
          requestedFileUrl = customDebugFile
        } else {
          log.debug('Serving static request %s', requestUrl)
          fileServer = serveStaticFile
          requestedFileUrl = requestUrl
        }

        fileServer(requestedFileUrl, response, function (data) {
          common.setNoCacheHeaders(response)

          var scriptTags = files.included.map(function (file) {
            var filePath = file.path
            var fileExt = path.extname(filePath)

            if (!file.isUrl) {
              filePath = filePathToUrlPath(filePath, basePath, urlRoot)

              if (requestUrl === '/context.html') {
                filePath += '?' + file.sha
              }
            }

            if (fileExt === '.css') {
              return util.format(LINK_TAG_CSS, filePath)
            }

            if (fileExt === '.html') {
              return util.format(LINK_TAG_HTML, filePath)
            }

            // The script tag to be placed
            var scriptType = (SCRIPT_TYPE[fileExt] || 'text/javascript')

            // In case there is a JavaScript version specified and this is a Firefox browser
            if (jsVersion && jsVersion > 0 && isFirefox(request)) {
              scriptType += ';version=' + jsVersion
            }

            return util.format(SCRIPT_TAG, scriptType, filePath)
          })

          // TODO(vojta): don't compute if it's not in the template
          var mappings = files.served.map(function (file) {
            // Windows paths contain backslashes and generate bad IDs if not escaped
            var filePath = filePathToUrlPath(file.path, basePath, urlRoot).replace(/\\/g, '\\\\')
            // Escape single quotes that might be in the filename -
            // double quotes should not be allowed!
            filePath = filePath.replace(/'/g, '\\\'')

            return util.format("  '%s': '%s'", filePath, file.sha)
          })

          var clientConfig = 'window.__karma__.config = ' + JSON.stringify(client) + ';\n'

          mappings = 'window.__karma__.files = {\n' + mappings.join(',\n') + '\n};\n'

          return data
            .replace('%SCRIPTS%', scriptTags.join('\n'))
            .replace('%CLIENT_CONFIG%', clientConfig)
            .replace('%MAPPINGS%', mappings)
            .replace('\n%X_UA_COMPATIBLE%', getXUACompatibleMetaElement(request.url))
        })
      }, function (errorFiles) {
        serveStaticFile(requestUrl, response, function (data) {
          common.setNoCacheHeaders(response)
          return data.replace('%SCRIPTS%', '').replace('%CLIENT_CONFIG%', '').replace('%MAPPINGS%',
            'window.__karma__.error("TEST RUN WAS CANCELLED because ' +
            (errorFiles.length > 1 ? 'these files contain' : 'this file contains') +
            ' some errors:\\n  ' + errorFiles.join('\\n  ') + '");')
        })
      })
    } else if (requestUrl === '/context.json') {
      return filesPromise.then(function (files) {
        common.setNoCacheHeaders(response)
        response.writeHead(200)
        response.end(JSON.stringify({
          files: files.included.map(function (file) {
            return filePathToUrlPath(file.path + '?' + file.sha, basePath, urlRoot)
          })
        }))
      })
    }

    return next()
  }
}

createKarmaMiddleware.$inject = [
  'filesPromise',
  'serveStaticFile',
  'serveFile',
  'injector',
  'config.basePath',
  'config.urlRoot'
]

// PUBLIC API
exports.create = createKarmaMiddleware
