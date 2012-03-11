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


var createHandler = function(fileGuardian, STATIC_FOLDER) {
  return function(request, response) {

    // helper for serving static file
    var serveStaticFile = function(file, process) {
      file = path.normalize(file);

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

    // SERVE client.html - main entry point
    if (request.url === '/') {
      return serveStaticFile(STATIC_FOLDER + '/client.html');
    }

    // SERVE testacular.js
    if (request.url === '/testacular.js') {
      return serveStaticFile(STATIC_FOLDER + '/testacular.js');
    }

    // SERVE context.html - execution context within the iframe
    // or runner.html - execution context without channel to the server
    if (request.url === '/context.html' || request.url === '/debug.html') {
      return serveStaticFile(STATIC_FOLDER + request.url, function(data, response) {
        // never cache
        setNoCacheHeaders(response);

        var scriptTags = fileGuardian.getFiles().map(function(file) {
          // add timestamps only for /context.html, no timestamps for /debug.html
          return util.format(SCRIPT_TAG, request.url === '/context.html' ?
              file.path + '?' + file.mtime.getTime() : file.path);
        });

        return data.replace('%SCRIPTS%', scriptTags.join('\n'));
      });
    }

    // OTHERWISE - js files
    return serveStaticFile(request.url.replace(/\?.*/, ''), function(data, response) {
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

exports.createWebServer = function(fileGuardian, staticFolder) {
  return http.createServer(createHandler(fileGuardian, staticFolder));
};
