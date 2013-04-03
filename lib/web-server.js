var fs = require('fs');
var http = require('http');
var path = require('path');
var util = require('util');
var querystring = require('querystring');
var httpProxy = require('http-proxy');
var pause = require('pause');
var mime = require('mime');

var VERSION = require('./constants').VERSION;
var helper = require('./helper');
var proxy = require('./proxy');
var log = require('./logger').create('web server');

var SCRIPT_TAG = '<script type="%s" src="%s"></script>';


var setNoCacheHeaders = function(response) {
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', (new Date(0)).toString());
};


var serveStaticFile = function(file, response, process) {
  fs.readFile(file, function(error, data) {
    if (error) {
      log.warn('404: ' + file);
      response.writeHead(404);
      return response.end('NOT FOUND');
    }

    // set content type
    response.setHeader('Content-Type', mime.lookup(file, 'text/plain'));

    // call custom process fn to transform the data
    var responseData = process && process(data.toString(), response) || data;
    response.writeHead(200);

    log.debug('serving: ' + file);
    return response.end(responseData);
  });
};


var createKarmaSourceHandler = function(promiseContainer, staticFolder, adapterFolder,
    baseFolder, urlRoot, customFileHandlers, customScriptTypes) {
  return function(request, response, next) {
    var requestUrl = request.url.replace(/\?.*/, '');
    if (requestUrl === urlRoot.substr(0, urlRoot.length - 1)) {
      response.setHeader('Location', urlRoot);
      response.writeHead(301);
      return response.end('MOVED PERMANENTLY');
    }

    if (requestUrl.indexOf(urlRoot) !== 0) {
      return next();
    }

    requestUrl = requestUrl.substring(urlRoot.length - 1);

    // Check if any of the custom file handlers provided by plugins should be
    // invoked first.
    for (var i = 0; i < customFileHandlers.length; i++) {
      if (customFileHandlers[i].urlRegex.test(requestUrl)) {
        return customFileHandlers[i].handler(request, response, staticFolder,
            adapterFolder, baseFolder, urlRoot);
      }
    }

    if (requestUrl === '/') {
      return serveStaticFile(staticFolder + '/client.html', response);
    }

    // SERVE karma.js
    if (requestUrl === '/karma.js') {
      return serveStaticFile(staticFolder + '/karma.js', response, function(data) {
        return data.replace('%KARMA_SRC_PREFIX%', urlRoot.substring(1))
                   .replace('%KARMA_VERSION%', VERSION);
      });
    }

    // SERVE context.html - execution context within the iframe
    // or runner.html - execution context without channel to the server
    if (requestUrl === '/context.html' || requestUrl === '/debug.html') {
      return promiseContainer.promise.then(function(files) {
        serveStaticFile(staticFolder + requestUrl, response, function(data, response) {
          // never cache
          setNoCacheHeaders(response);

          var scriptTags = files.included.map(function(file) {
            var filePath = file.path;
            var scriptType = 'text/javascript';
            customScriptTypes.forEach(function(type) {
              var extension = '.' + type.extension;
              if (filePath.indexOf(extension, filePath.length - extension.length) !== -1) {
                scriptType = type.contentType;
              }
            });

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

            return util.format(SCRIPT_TAG, scriptType, filePath);
          });

          var mappings = files.served.map(function(file) {
            var filePath = file.path;

            // TODO(vojta): refactor to remove code duplication
            // TODO(vojta): don't compute if it's not in the template
            if (filePath.indexOf(adapterFolder) === 0) {
              filePath = '/adapter' + filePath.substr(adapterFolder.length);
            } else if (filePath.indexOf(baseFolder) === 0) {
              filePath = '/base' + filePath.substr(baseFolder.length);
            } else {
              filePath = '/absolute' + filePath;
            }

            return util.format('  \'%s\': \'%d\'', filePath, file.mtime.getTime());
          });

          mappings = 'window.__karma__.files = {\n' + mappings.join(',\n') + '\n};\n';

          return data.replace('%SCRIPTS%', scriptTags.join('\n')).replace('%MAPPINGS%', mappings);
        });
      });
    }

    return next();
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


var createSourceFileHandler = function(promiseContainer, adapterFolder, baseFolder) {
  return function(request, response, next) {
    // Need to pause the request because of proxying, see:
    // https://groups.google.com/forum/#!topic/q-continuum/xr8znxc_K5E/discussion
    var pausedReqest = pause(request);
    var requestedFilePath = request.url.replace(/\?.*/, '')
        .replace(/^\/adapter/, adapterFolder)
        .replace(/^\/absolute/, '')
        .replace(/^\/base/, baseFolder);

    requestedFilePath = querystring.unescape(requestedFilePath);

    promiseContainer.promise.then(function(files) {
      var file = findByPath(files.served, requestedFilePath);

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
      } else {
        next();
      }

      pausedReqest.resume();
    });
  };
};


var createHandler = function(promiseContainer, staticFolder, adapterFolder, baseFolder, proxyFn,
    proxies, urlRoot, customFileHandlers, customScriptTypes) {
  var karmaSrcHandler = createKarmaSourceHandler(promiseContainer, staticFolder,
      adapterFolder, baseFolder, urlRoot, customFileHandlers, customScriptTypes);
  var proxiedPathsHandler = proxy.createProxyHandler(proxyFn, proxies);
  var sourceFileHandler = createSourceFileHandler(promiseContainer, adapterFolder, baseFolder);

  return function(request, response) {
    karmaSrcHandler(request, response, function() {
      sourceFileHandler(request, response, function() {
        proxiedPathsHandler(request, response, function() {
          response.writeHead(404);
          response.end('NOT FOUND');
        });
      });
    });
  };
};


exports.createWebServer = function (baseFolder, proxies, urlRoot,
    customFileHandlers, customScriptTypes) {
  var staticFolder = path.normalize(__dirname + '/../static');
  var adapterFolder = path.normalize(__dirname + '/../adapter');

  var promiseContainer = {
    promise: null
  };

  var server = http.createServer(createHandler(promiseContainer,
      helper.normalizeWinPath(staticFolder), helper.normalizeWinPath(adapterFolder), baseFolder,
      new httpProxy.RoutingProxy({changeOrigin: true}), proxies, urlRoot, customFileHandlers,
      customScriptTypes));

  server.updateFilesPromise = function(promise) {
    promiseContainer.promise = promise;
  };

  return server;
};

exports.createWebServer.$inject = ['config.basePath', 'config.proxies', 'config.urlRoot',
    'customFileHandlers', 'customScriptTypes'];
