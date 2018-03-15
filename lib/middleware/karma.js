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
var _ = require('lodash')

var log = require('../logger').create('middleware:karma')

var urlparse = function (urlStr) {
  var urlObj = url.parse(urlStr, true)
  urlObj.query = urlObj.query || {}
  return urlObj
}

var common = require('./common')

var VERSION = require('../constants').VERSION
var SCRIPT_TAG = '<script type="%s" src="%s" %s></script>'
var CROSSORIGIN_ATTRIBUTE = 'crossorigin="anonymous"'
var LINK_TAG_CSS = '<link type="text/css" href="%s" rel="stylesheet">'
var LINK_TAG_HTML = '<link href="%s" rel="import">'
var SCRIPT_TYPE = {
  'js': 'text/javascript',
  'dart': 'application/dart',
  'module': 'module'
}
var FILE_TYPES = [
  'css',
  'html',
  'js',
  'dart',
  'module'
]

var filePathToUrlPath = function (filePath, basePath, urlRoot, proxyPath) {
  if (filePath.indexOf(basePath) === 0) {
    return proxyPath + urlRoot.substr(1) + 'base' + filePath.substr(basePath.length)
  }

  return proxyPath + urlRoot.substr(1) + 'absolute' + filePath
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
  urlRoot,
  upstreamProxy
) {
  var proxyPath = upstreamProxy ? upstreamProxy.path : '/'
  return function (request, response, next) {
    // These config values should be up to date on every request
    var client = injector.get('config.client')
    var customContextFile = injector.get('config.customContextFile')
    var customDebugFile = injector.get('config.customDebugFile')
    var customClientContextFile = injector.get('config.customClientContextFile')
    var jsVersion = injector.get('config.jsVersion')
    var includeCrossOriginAttribute = injector.get('config.crossOriginAttribute')

    var requestUrl = request.normalizedUrl.replace(/\?.*/, '')
    var requestedRangeHeader = request.headers['range']

    // redirect /__karma__ to /__karma__ (trailing slash)
    if (requestUrl === urlRoot.substr(0, urlRoot.length - 1)) {
      response.setHeader('Location', proxyPath + urlRoot.substr(1))
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
      // redirect client_with_context.html
      if (!client.useIframe && client.runInParent) {
        requestUrl = '/client_with_context.html'
      } else { // serve client.html
        return serveStaticFile('/client.html', requestedRangeHeader, response, function (data) {
          return data
            .replace('\n%X_UA_COMPATIBLE%', getXUACompatibleMetaElement(request.url))
            .replace('%X_UA_COMPATIBLE_URL%', getXUACompatibleUrl(request.url))
        })
      }
    }

    // serve karma.js, context.js, and debug.js
    var jsFiles = ['/karma.js', '/context.js', '/debug.js']
    var isRequestingJsFile = jsFiles.indexOf(requestUrl) !== -1
    if (isRequestingJsFile) {
      return serveStaticFile(requestUrl, requestedRangeHeader, response, function (data) {
        return data.replace('%KARMA_URL_ROOT%', urlRoot)
          .replace('%KARMA_VERSION%', VERSION)
          .replace('%KARMA_PROXY_PATH%', proxyPath)
      })
    }

    // serve the favicon
    if (requestUrl === '/favicon.ico') {
      return serveStaticFile(requestUrl, requestedRangeHeader, response)
    }

    // serve context.html - execution context within the iframe
    // or debug.html - execution context without channel to the server
    var isRequestingContextFile = requestUrl === '/context.html'
    var isRequestingDebugFile = requestUrl === '/debug.html'
    var isRequestingClientContextFile = requestUrl === '/client_with_context.html'
    if (isRequestingContextFile || isRequestingDebugFile || isRequestingClientContextFile) {
      return filesPromise.then(function (files) {
        var fileServer
        var requestedFileUrl
        log.debug('custom files', customContextFile, customDebugFile, customClientContextFile)
        if (isRequestingContextFile && customContextFile) {
          log.debug('Serving customContextFile %s', customContextFile)
          fileServer = serveFile
          requestedFileUrl = customContextFile
        } else if (isRequestingDebugFile && customDebugFile) {
          log.debug('Serving customDebugFile %s', customDebugFile)
          fileServer = serveFile
          requestedFileUrl = customDebugFile
        } else if (isRequestingClientContextFile && customClientContextFile) {
          log.debug('Serving customClientContextFile %s', customClientContextFile)
          fileServer = serveFile
          requestedFileUrl = customClientContextFile
        } else {
          log.debug('Serving static request %s', requestUrl)
          fileServer = serveStaticFile
          requestedFileUrl = requestUrl
        }

        fileServer(requestedFileUrl, requestedRangeHeader, response, function (data) {
          common.setNoCacheHeaders(response)

          var scriptTags = []
          var scriptUrls = []
          for (var i = 0; i < files.included.length; i++) {
            var file = files.included[i]
            var filePath = file.path
            var fileExt = path.extname(filePath)
            var fileType = file.type

            if (!files.included.hasOwnProperty(i)) {
              continue
            }

            if (!_.isUndefined(fileType) && FILE_TYPES.indexOf(fileType) === -1) {
              log.warn('Invalid file type, defaulting to js.', fileType)
            }

            if (!file.isUrl) {
              filePath = filePathToUrlPath(filePath, basePath, urlRoot, proxyPath)

              if (requestUrl === '/context.html') {
                filePath += '?' + file.sha
              }
            }

            scriptUrls.push(filePath)

            if (fileType === 'css' || (!fileType && fileExt === '.css')) {
              scriptTags.push(util.format(LINK_TAG_CSS, filePath))
              continue
            }

            if (fileType === 'html' || (!fileType && fileExt === '.html')) {
              scriptTags.push(util.format(LINK_TAG_HTML, filePath))
              continue
            }

            // The script tag to be placed
            var scriptFileType = (fileType || fileExt.substring(1))
            var scriptType = (SCRIPT_TYPE[scriptFileType] || 'text/javascript')

            // In case there is a JavaScript version specified and this is a Firefox browser
            if (jsVersion && jsVersion > 0 && isFirefox(request)) {
              var agent = useragent.parse(request.headers['user-agent'])

              log.warn('jsVersion configuration property is deprecated and will be removed in the next major release of Karma.')

              if (agent.major < 59) {
                scriptType += ';version=' + jsVersion
              } else {
                log.warn('jsVersion is not supported in Firefox 59+ (see https://bugzilla.mozilla.org/show_bug.cgi?id=1428745 for more details). Ignoring.')
              }
            }

            var crossOriginAttribute = includeCrossOriginAttribute ? CROSSORIGIN_ATTRIBUTE : ''
            scriptTags.push(util.format(SCRIPT_TAG, scriptType, filePath, crossOriginAttribute))
          }

          // TODO(vojta): don't compute if it's not in the template
          var mappings = files.served.map(function (file) {
            // Windows paths contain backslashes and generate bad IDs if not escaped
            var filePath = filePathToUrlPath(file.path, basePath, urlRoot, proxyPath).replace(/\\/g, '\\\\')
            // Escape single quotes that might be in the filename -
            // double quotes should not be allowed!
            filePath = filePath.replace(/'/g, '\\\'')

            return util.format("  '%s': '%s'", filePath, file.sha)
          })

          var clientConfig = 'window.__karma__.config = ' + JSON.stringify(client) + ';\n'

          var scriptUrlsJS = 'window.__karma__.scriptUrls = ' + JSON.stringify(scriptUrls) + ';\n'

          mappings = 'window.__karma__.files = {\n' + mappings.join(',\n') + '\n};\n'

          return data
            .replace('%SCRIPTS%', scriptTags.join('\n'))
            .replace('%CLIENT_CONFIG%', clientConfig)
            .replace('%SCRIPT_URL_ARRAY%', scriptUrlsJS)
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
            return filePathToUrlPath(file.path + '?' + file.sha, basePath, urlRoot, proxyPath)
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
  'config.urlRoot',
  'config.upstreamProxy'
]

// PUBLIC API
exports.create = createKarmaMiddleware
