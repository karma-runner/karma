var fs = require('fs'),
    http = require('http'),
    util = require('util'),
    u = require('./util'),
    path = require('path'),
    log = require('./logger').create('web server'),
    url = require('url'),
    httpProxy = require('http-proxy');

var SCRIPT_TAG = '<script type="text/javascript" src="%s"></script>';
var MIME_TYPE = {
  txt: 'text/plain',
  html: 'text/html',
  js: 'application/javascript'
};

var setNoCacheHeaders = function(response) {
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', (new Date(0)).toString());
};


/**
 * Web Server handler
 *
 * URL schema structure:
 * /base/... (files in basePath, commonly project root, relative paths)
 * /absolute/... (files outside of basePath, absolute paths)
 * /adapter/... (testacular adapters)
 */
var createHandler = function(fileList, staticFolder, adapterFolder, baseFolder, proxy, proxies) {

  return function(request, response) {

    var files = fileList.getFiles();

    var getProxiedPath = function(requestUrl) {
      var proxiedUrl;
      if (proxies) {
        var proxiesList = Object.keys(proxies);
        proxiesList.sort();
        proxiesList.reverse();
        for (var i = 0; i < proxiesList.length; i++) {
          if (requestUrl.indexOf(proxiesList[i]) === 0) {
            proxiedUrl = url.parse(proxies[proxiesList[i]]);
            break;
          }
        }
      }
      return proxiedUrl;
    };

    // helper for serving static file
    var serveStaticFile = function(file, process) {
      fs.readFile(file, function(error, data) {

        if (error) {
          log.warn('404: ' + file);
          response.writeHead(404);
          return response.end('NOT FOUND');
        }

        // set content type
        response.setHeader('Content-Type', MIME_TYPE[file.split('.').pop()] || MIME_TYPE.txt);

        // call custom process fn to transform the data
        var responseData = process && process(data.toString(), response) || data;
        response.writeHead(200);

        log.debug('serving: ' + file);
        return response.end(responseData);
      });
    };

    // TODO(vojta): clean the url namespace (put everything to /__testacular__/ or so)
    // TODO(vojta): no cache for testacular.js and client.html ? (updating testacular)

    var requestedFilePath = request.url.replace(/\?.*/, '')
                                       .replace(/^\/adapter/, adapterFolder)
                                       .replace(/^\/absolute/, '')
                                       .replace(/^\/base/, baseFolder);

    // SERVE client.html - main entry point
    if (requestedFilePath === '/') {
      return serveStaticFile(staticFolder + '/client.html');
    }

    // SERVE testacular.js
    if (request.url === '/testacular.js') {
      return serveStaticFile(staticFolder + '/testacular.js');
    }

    // SERVE context.html - execution context within the iframe
    // or runner.html - execution context without channel to the server
    if (request.url === '/context.html' || request.url === '/debug.html') {
      return serveStaticFile(staticFolder + request.url, function(data, response) {
        // never cache
        setNoCacheHeaders(response);

        var scriptTags = files.map(function(file) {
          var filePath = file.path;

          if (!file.isUrl) {
            if (filePath.indexOf(adapterFolder) === 0) {
              filePath = '/adapter' + filePath.substr(adapterFolder.length);
            } else if (filePath.indexOf(baseFolder) === 0) {
              filePath = '/base' + filePath.substr(baseFolder.length);
            } else {
              filePath = '/absolute' + filePath;
            }

            if (request.url === '/context.html') {
              filePath += '?' + file.mtime.getTime();
            }
          }

          return util.format(SCRIPT_TAG, filePath);
        });

        return data.replace('%SCRIPTS%', scriptTags.join('\n'));
      });
    }

    var equalsPath = function(file) {
      return file.path === requestedFilePath;
    };

    // Check if proxied path, and if so, route it through proxy
    var proxiedPath = getProxiedPath(request.url);
    if (proxiedPath) {
      proxiedPath.port = proxiedPath.port || '80';
      return proxy.proxyRequest(request, response, {host: proxiedPath.hostname, port: proxiedPath.port});
    }


    // not in the file list - forbidden
    if (!files.some(equalsPath)) {
      response.writeHead(404);
      return response.end('NOT FOUND');
    }

    // OTHERWISE - js files
    return serveStaticFile(requestedFilePath, function(data, response) {
      if (/\?\d+/.test(request.url)) {
        // files with timestamps - cache one year, rely on timestamps
        response.setHeader('Cache-Control', ['public', 'max-age=31536000']);
      } else {
        // without timestamps - no cache (debug)
        setNoCacheHeaders(response);
      }
    });
  };
};

exports.createWebServer = function (fileList, baseFolder, proxies) {
  var staticFolder = path.normalize(__dirname + '/../static');
  var adapterFolder = path.normalize(__dirname + '/../adapter');
  var proxy = new httpProxy.RoutingProxy();

  return http.createServer(createHandler(fileList, u.normalizeWinPath(staticFolder),
                                         u.normalizeWinPath(adapterFolder), baseFolder,
                                         proxy, proxies));
};
