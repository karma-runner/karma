var fs = require('fs'),
    http = require('http'),
    util = require('util'),
    log = require('./logger').create('web server');

var SCRIPT_TAG = '<script type="text/javascript" src="%s"></script>';
var MIME_TYPE = {
  txt: 'text/plain',
  html: 'text/html',
  js: 'application/javascript'
};

var createHandler = function(fileGuardian, STATIC_FOLDER) {
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

    // SERVE client.html - main entry point
    if (request.url === '/') {
      return serveStaticFile(STATIC_FOLDER + 'client.html');
    }

    // SERVE context.html - execution context within the iframe
    if (request.url === '/context.html') {
      return serveStaticFile(STATIC_FOLDER + 'context.html', function(data, response) {
        // never cache
        response.setHeader('Cache-Control', 'no-cache');

        // replace script tags
        var scriptTags = [];
        fileGuardian.getFiles().forEach(function(file) {
          scriptTags.push(util.format(SCRIPT_TAG, file.path + '?' + file.mtime.getTime()));
        });

        return data.replace('%SCRIPTS%', scriptTags.join('\n'));
      });
    }

    // OTHERWISE - js files
    return serveStaticFile(request.url.replace(/\?.*/, ''), function(data, response) {
      // cache one year, rely on timestamps
      response.setHeader('Cache-Control', ['public', 'max-age=31536000']);
    });
  };
};

exports.createWebServer = function(fileGuardian, staticFolder) {
  return http.createServer(createHandler(fileGuardian, staticFolder));
};
