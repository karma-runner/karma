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

const path = require('path')
const util = require('util')
const url = require('url')
const _ = require('lodash')

const log = require('../logger').create('middleware:karma')
const stripHost = require('./strip_host').stripHost

function urlparse (urlStr) {
  const urlObj = url.parse(urlStr, true)
  urlObj.query = urlObj.query || {}
  return urlObj
}

const common = require('./common')

const VERSION = require('../constants').VERSION
const SCRIPT_TAG = '<script type="%s" src="%s" %s></script>'
const CROSSORIGIN_ATTRIBUTE = 'crossorigin="anonymous"'
const LINK_TAG_CSS = '<link type="text/css" href="%s" rel="stylesheet">'
const LINK_TAG_HTML = '<link href="%s" rel="import">'
const SCRIPT_TYPE = {
  'js': 'text/javascript',
  'dart': 'application/dart',
  'module': 'module'
}
const FILE_TYPES = [
  'css',
  'html',
  'js',
  'dart',
  'module'
]

function filePathToUrlPath (filePath, basePath, urlRoot, proxyPath) {
  if (filePath.indexOf(basePath) === 0) {
    return proxyPath + urlRoot.substr(1) + 'base' + filePath.substr(basePath.length)
  }

  return proxyPath + urlRoot.substr(1) + 'absolute' + filePath
}

function getXUACompatibleMetaElement (url) {
  let tag = ''
  const urlObj = urlparse(url)
  if (urlObj.query['x-ua-compatible']) {
    tag = '\n<meta http-equiv="X-UA-Compatible" content="' +
      urlObj.query['x-ua-compatible'] + '"/>'
  }
  return tag
}

function getXUACompatibleUrl (url) {
  let value = ''
  const urlObj = urlparse(url)
  if (urlObj.query['x-ua-compatible']) {
    value = '?x-ua-compatible=' + encodeURIComponent(urlObj.query['x-ua-compatible'])
  }
  return value
}

function createKarmaMiddleware (
  filesPromise,
  serveStaticFile,
  serveFile,
  injector,
  basePath,
  urlRoot,
  upstreamProxy,
  browserSocketTimeout
) {
  const proxyPath = upstreamProxy ? upstreamProxy.path : '/'
  return function (request, response, next) {
    // These config values should be up to date on every request
    const client = injector.get('config.client')
    const customContextFile = injector.get('config.customContextFile')
    const customDebugFile = injector.get('config.customDebugFile')
    const customClientContextFile = injector.get('config.customClientContextFile')
    const includeCrossOriginAttribute = injector.get('config.crossOriginAttribute')

    const normalizedUrl = stripHost(request.url) || request.url
    // For backwards compatibility in middleware plugins, remove in v4.
    request.normalizedUrl = normalizedUrl

    let requestUrl = normalizedUrl.replace(/\?.*/, '')
    const requestedRangeHeader = request.headers['range']

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
    const jsFiles = ['/karma.js', '/context.js', '/debug.js']
    const isRequestingJsFile = jsFiles.indexOf(requestUrl) !== -1
    if (isRequestingJsFile) {
      return serveStaticFile(requestUrl, requestedRangeHeader, response, function (data) {
        return data.replace('%KARMA_URL_ROOT%', urlRoot)
          .replace('%KARMA_VERSION%', VERSION)
          .replace('%KARMA_PROXY_PATH%', proxyPath)
          .replace('%BROWSER_SOCKET_TIMEOUT%', browserSocketTimeout)
      })
    }

    // serve the favicon
    if (requestUrl === '/favicon.ico') {
      return serveStaticFile(requestUrl, requestedRangeHeader, response)
    }

    // serve context.html - execution context within the iframe
    // or debug.html - execution context without channel to the server
    const isRequestingContextFile = requestUrl === '/context.html'
    const isRequestingDebugFile = requestUrl === '/debug.html'
    const isRequestingClientContextFile = requestUrl === '/client_with_context.html'
    if (isRequestingContextFile || isRequestingDebugFile || isRequestingClientContextFile) {
      return filesPromise.then(function (files) {
        let fileServer
        let requestedFileUrl
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

          const scriptTags = []
          const scriptUrls = []
          for (let i = 0; i < files.included.length; i++) {
            const file = files.included[i]
            let filePath = file.path
            const fileExt = path.extname(filePath)
            const fileType = file.type

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
            const scriptFileType = (fileType || fileExt.substring(1))
            const scriptType = (SCRIPT_TYPE[scriptFileType] || 'text/javascript')

            const crossOriginAttribute = includeCrossOriginAttribute ? CROSSORIGIN_ATTRIBUTE : ''
            scriptTags.push(util.format(SCRIPT_TAG, scriptType, filePath, crossOriginAttribute))
          }

          // TODO(vojta): don't compute if it's not in the template
          let mappings = files.served.map(function (file) {
            // Windows paths contain backslashes and generate bad IDs if not escaped
            let filePath = filePathToUrlPath(file.path, basePath, urlRoot, proxyPath).replace(/\\/g, '\\\\')
            // Escape single quotes that might be in the filename -
            // double quotes should not be allowed!
            filePath = filePath.replace(/'/g, '\\\'')

            return util.format("  '%s': '%s'", filePath, file.sha)
          })

          const clientConfig = 'window.__karma__.config = ' + JSON.stringify(client) + ';\n'

          const scriptUrlsJS = 'window.__karma__.scriptUrls = ' + JSON.stringify(scriptUrls) + ';\n'

          mappings = 'window.__karma__.files = {\n' + mappings.join(',\n') + '\n};\n'

          return data
            .replace('%SCRIPTS%', scriptTags.join('\n'))
            .replace('%CLIENT_CONFIG%', clientConfig)
            .replace('%SCRIPT_URL_ARRAY%', scriptUrlsJS)
            .replace('%MAPPINGS%', mappings)
            .replace('\n%X_UA_COMPATIBLE%', getXUACompatibleMetaElement(request.url))
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
  'config.upstreamProxy',
  'config.browserSocketTimeout'
]

// PUBLIC API
exports.create = createKarmaMiddleware
