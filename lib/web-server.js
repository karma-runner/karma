var fs = require('fs');
var path = require('path');
var connect = require('connect');
var constant = require('./constants');

var common = require('./middleware/common');
var runnerMiddleware = require('./middleware/runner');
var stripHostMiddleware = require('./middleware/strip_host');
var karmaMiddleware = require('./middleware/karma');
var sourceFilesMiddleware = require('./middleware/source_files');
var proxyMiddleware = require('./middleware/proxy');

var log = require('./logger').create('web-server');

var createCustomHandler = function(customFileHandlers, /* config.basePath */ basePath) {
  return function(request, response, next) {
    for (var i = 0; i < customFileHandlers.length; i++) {
      if (customFileHandlers[i].urlRegex.test(request.url)) {
        return customFileHandlers[i].handler(request, response, 'fake/static', 'fake/adapter',
            basePath, 'fake/root');
      }
    }

    return next();
  };
};


var createWebServer = function(injector, emitter, protocol, certificate) {
  var serveStaticFile = common.createServeFile(fs, path.normalize(__dirname + '/../static'));
  var serveFile = common.createServeFile(fs);
  var filesPromise = new common.PromiseContainer();

  emitter.on('file_list_modified', function(files) {
    filesPromise.set(files);
  });

  // locals for webserver module
  // NOTE(vojta): figure out how to do this with DI
  injector = injector.createChild([{
    serveFile: ['value', serveFile],
    serveStaticFile: ['value', serveStaticFile],
    filesPromise: ['value', filesPromise]
  }]);

  var proxyMiddlewareInstance = injector.invoke(proxyMiddleware.create);

  var handler = connect()
      .use(injector.invoke(runnerMiddleware.create))
      .use(injector.invoke(stripHostMiddleware.create))
      .use(injector.invoke(karmaMiddleware.create))
      .use(injector.invoke(sourceFilesMiddleware.create))
      // TODO(vojta): extract the proxy into a plugin
      .use(proxyMiddlewareInstance)
      // TODO(vojta): remove, this is only here because of karma-dart
      // we need a better way of custom handlers
      .use(injector.invoke(createCustomHandler))
      .use(function(request, response) {
        common.serve404(response, request.url);
      });

  var server;
  var options;
  if (protocol === constant.HTTPS_PROTOCOL) {
    if (certificate.onetime) {
      options = certificate.onetime;
      log.debug('Using one-time certificate');
    } else {
      options = {
        key: fs.readFileSync(certificate.key),
        cert: fs.readFileSync(certificate.cert)
      };
      log.debug('Using certificate files:');
      log.debug('  Key: %s', certificate.key);
      log.debug(' Cert: %s', certificate.cert);
    }
    server = require('https').createServer(options, handler);
  } else {
    server = require('http').createServer(handler);
  }

  server.on('upgrade', function(req, socket, head) {
    log.debug('upgrade %s', req.url);
    proxyMiddlewareInstance.upgrade(req, socket, head);
  });

  return server;
};

createWebServer.$inject = ['injector', 'emitter', 'config.protocol', 'config.cert'];

// PUBLIC API
exports.create = createWebServer;
