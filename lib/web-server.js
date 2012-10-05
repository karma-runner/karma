var http = require('http');
var u = require('./util');
var path = require('path');
var httpProxy = require('http-proxy');
var proxy = require('./proxy');
var fs = require('fs');
var log = require('./logger').create('web server');
var util = require('util');

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


exports.createWebServer = function (fileList, baseFolder, proxies, urlRoot) {
  var staticFolder = path.normalize(__dirname + '/../static');
  var adapterFolder = path.normalize(__dirname + '/../adapter');

  return http.createServer(createHandler(fileList, u.normalizeWinPath(staticFolder),
                                         u.normalizeWinPath(adapterFolder), baseFolder,
                                         new httpProxy.RoutingProxy({changeOrigin: true}), proxies, urlRoot));
};

var createHandler = function(fileList, staticFolder, adapterFolder, baseFolder, proxyFn, proxies, urlRoot) {
  var testacularSrcHandler = createTestacularSourceHandler(fileList, staticFolder, adapterFolder, baseFolder, urlRoot);
  var proxiedPathsHandler = proxy.createProxyHandler(proxyFn, proxies);
  var sourceFileHandler = createSourceFileHandler(fileList, adapterFolder, baseFolder);
  return function(request, response) {
    if (testacularSrcHandler(request, response)) {
      return;
    }
    if (sourceFileHandler(request, response)) {
      return;
    }
    if (proxiedPathsHandler(request, response)) {
      return;
    }
    response.writeHead(404);
    return response.end('NOT FOUND');
  };
};

var serveStaticFile = function(file, response, process) {
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


var createTestacularSourceHandler = function(fileList, staticFolder, adapterFolder, baseFolder, urlRoot) {
  return function(request, response) {
    var requestUrl = request.url.replace(/\?.*/, '');

    if (requestUrl === urlRoot.substr(0, urlRoot.length - 1)) {
      response.setHeader('Location', urlRoot);
      response.writeHead(301);
      response.end('MOVED PERMANENTLY');
      return true;
    }

    if (requestUrl.indexOf(urlRoot) !== 0) {
      return false;
    }

    requestUrl = requestUrl.substring(urlRoot.length - 1);

    if (requestUrl === '/') {
      serveStaticFile(staticFolder + '/client.html', response);
      return true;
    }

    // SERVE testacular.js
    if (requestUrl === '/testacular.js') {
      serveStaticFile(staticFolder + '/testacular.js', response, function(data, response) {
        return data.replace('%TESTACULAR_SRC_PREFIX%', urlRoot.substring(1));
      });
      return true;
    }

    // SERVE context.html - execution context within the iframe
    // or runner.html - execution context without channel to the server
    if (requestUrl === '/context.html' || requestUrl === '/debug.html') {
      serveStaticFile(staticFolder + requestUrl, response, function(data, response) {
        // never cache
        setNoCacheHeaders(response);

        var scriptTags = fileList.getFiles().map(function(file) {
          var filePath = file.path;

          if (!file.isUrl) {
            // TODO(vojta): serve these files from within urlRoot as well
            if (filePath.indexOf(adapterFolder) === 0) {
              filePath = '/adapter' + filePath.substr(adapterFolder.length);
            } else if (filePath.indexOf(baseFolder) === 0) {
              filePath = '/base' + filePath.substr(baseFolder.length);
            } else {
              filePath = '/absolute' + filePath;
            }

            if (requestUrl === '/context.html') {
              filePath += '?' + file.mtime.getTime();
            }
          }

          return util.format(SCRIPT_TAG, filePath);
        });

        return data.replace('%SCRIPTS%', scriptTags.join('\n'));
      });

      return true;
    }

    return false;
  };
};

var findByPath = function(files, path) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].path === path) {
      return files[i];
    }
  }

  return null;
};


var createSourceFileHandler = function(fileList, adapterFolder, baseFolder) {
  return function(request, response) {
    var requestedFilePath = request.url.replace(/\?.*/, '')
        .replace(/^\/adapter/, adapterFolder)
        .replace(/^\/absolute/, '')
        .replace(/^\/base/, baseFolder);

    var file = findByPath(fileList.getFiles(), requestedFilePath);

    if (file) {
      serveStaticFile(file.contentPath, response, function(data, response) {
        if (/\?\d+/.test(request.url)) {
          // files with timestamps - cache one year, rely on timestamps
          response.setHeader('Cache-Control', ['public', 'max-age=31536000']);
        } else {
          // without timestamps - no cache (debug)
          setNoCacheHeaders(response);
        }
      });
      return true;
    }
    return false;
  };
};
