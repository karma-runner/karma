var fs = require('fs'),
    http = require('http'),
    util = require('util');

var STATIC_FOLDER = __dirname + '/../static/',
    SCRIPT_TAG = '<script type="text/javascript" src="%s"></script>',
    MIME_TYPE = {
      txt: 'text/plain',
      html: 'text/html',
      js: 'application/javascript'
//      css: 'text/css',
//      xml: 'application/xml',
//      json: 'application/json',
//      jpg: 'image/jpeg',
//      jpeg: 'image/jpeg',
//      gif: 'image/gif',
//      png: 'image/png',
//      manifest: 'text/cache-manifest'
    };

var createHandler = function(fileGuardian) {
  return function(request, response) {

    // helper for serving static file
    var serveStaticFile = function(file, process) {
      fs.readFile(file, function(error, data) {
        if (error) {
          response.writeHead(404);
          return response.end('NOT FOUND');
        }

        // set content type
        response.setHeader('Content-Type', MIME_TYPE[file.split('.').pop()] || MIME_TYPE.txt);

        // call custom process fn to transform the data
        var responseData = process && process(data.toString(), response) || data;
        response.writeHead(200);

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

exports.createWebServer = function(fileGuardian) {
  return http.createServer(createHandler(fileGuardian));
};
