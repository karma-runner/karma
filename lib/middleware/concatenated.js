var common = require('./common');
var querystring = require('querystring');

// Serves all 'served' JavaScript sources in a single request under /concatenated.js.
var createConcatenatedJsMiddleware = function(filesPromise, /* config.basePath */ basePath) {
  var removeBasePathRegExp = new RegExp('^' + basePath);
  return function(request, response, next) {
    var query = querystring.unescape(request.url);
    if (query !== '/concatenated.js') {
      return next();
    }

    common.setNoCacheHeaders(response);
    response.writeHead(200, {'Content-Type': 'text/javascript'});

    return filesPromise.then(function(files) {
      for (var i = 0; i < files.served.length; i++) {
        var file = files.served[i];
        var dotIdx = file.originalPath.lastIndexOf('.');
        if (dotIdx === -1 || file.originalPath.substring(dotIdx) !== '.js') {
          continue;
        }

        var path = file.originalPath.replace(removeBasePathRegExp, '');
        response.write('// ');
        response.write(path);
        response.write('\ntry{eval(');
        var content = file.content + '\n//# sourceURL=http://concatenate' + path;
        response.write(JSON.stringify(content));
        // Append fileName for syntax errors in case the JS VM doesn't do it itself.
        response.write(');} catch(e) { if (!e.fileName) e.message +=');
        response.write(JSON.stringify(' @' + path));
        response.write('; throw e;}\n\n');
      }

      return response.end();
    });
  };
};

exports.create = createConcatenatedJsMiddleware;
