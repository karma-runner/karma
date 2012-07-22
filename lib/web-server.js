var fs = require('fs'),
    http = require('http'),
    util = require('util'),
    path = require('path'),
    log = require('./logger').create('web server');

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
var createHandler = function(fileGuardian, staticFolder, adapterFolder, baseFolder) {
  staticFolder = path.normalize(staticFolder);
  adapterFolder = path.normalize(adapterFolder);
  baseFolder = path.normalize(baseFolder);

  return function(request, response) {

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

    if (process.platform === 'win32') {
      requestedFilePath = requestedFilePath.replace(/\//g, '\\');
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

        var scriptTags = fileGuardian.getFiles().map(function(file) {
          var filePath = file.path;

          if (filePath.indexOf(adapterFolder) === 0) {
            filePath = '/adapter' + filePath.substr(adapterFolder.length);
          } else if (filePath.indexOf(baseFolder) === 0) {
            filePath = '/base' + filePath.substr(baseFolder.length);
          } else {
            filePath = '/absolute' + filePath;
          }

          if (process.platform === 'win32' && !file.isUrl) {
            filePath = filePath.replace(/\\/g, '/');
          }

          // Add timestamps only for /context.html, no timestamps for /debug.html or urls
          return util.format(SCRIPT_TAG, request.url === '/context.html' && !file.isUrl ?
              filePath + '?' + file.mtime.getTime() : filePath);
        });

        return data.replace('%SCRIPTS%', scriptTags.join('\n'));
      });
    }

    var equalsPath = function(file) {
      return file.path === requestedFilePath;
    };

    // not in the file list - forbidden
    if (!fileGuardian.getFiles().some(equalsPath)) {
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

exports.createWebServer = function(fileGuardian, staticFolder, adapterFolder, baseFolder) {
  return http.createServer(createHandler(fileGuardian, staticFolder, adapterFolder, baseFolder));
};
