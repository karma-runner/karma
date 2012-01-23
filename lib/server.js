var io = require('socket.io');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');

var STATIC_FOLDER = __dirname + '/../static/';

// TODO(vojta): get this whole mess under test
exports.start = function(configFilePath) {
  var config = cfg.parseConfig(configFilePath);

  logger.setLevel(config.logLevel);
  logger.useColors(config.logColors);

  var log = logger.create();
  var fileGuardian = new cfg.FileGuardian(config.files, config.exclude, config.autoWatch, config.autoWatchInterval);

  log.info('Starting web server at http://localhost:' + config.port);
  var webServer = ws.createWebServer(fileGuardian, STATIC_FOLDER).listen(config.port);
  var socketServer = io.listen(webServer, {
    logger: logger.create('socket.io', 0),
    transports: ['websocket', 'xhr-polling', 'jsonp-polling']
  });

  var capturedBrowsers = new browser.Collection();
  var executionScheduled = false;
  var pendingCount = 0;

  capturedBrowsers.on('change', function() {
    if (executionScheduled) tryExecution();

    // TODO(vojta): send only to interested browsers
    socketServer.sockets.emit('info', capturedBrowsers.serialize());
  });

  var tryExecution = function() {
    var nonReady = [];

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://localhost:' + config.port);
    } else if (capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      capturedBrowsers.clearResults();
      pendingCount = capturedBrowsers.length;
      socketServer.sockets.emit('execute', {});
    } else {
      log.debug('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
    }
  };

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers);

    socket.on('complete', function() {
      pendingCount--;

      if (!pendingCount && capturedBrowsers.length > 1) {
        var results = capturedBrowsers.getResults();
        log.result('TOTAL FAILED: %d PASSED: %d', results.failed, results.success);
      }
    });
  });

  fileGuardian.on('fileModified', function() {
    log.debug('Execution (fired by autoWatch)');
    tryExecution();
  });

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      log.debug('Execution (fired by runner)');
      fileGuardian.checkModifications();
      tryExecution();
    });
  }).listen(config.runnerPort);

  process.on('SIGINT', function () {
    socketServer.sockets.emit('temp-disconnect');

//    var sockets = socketServer.sockets.sockets;
//    Object.getOwnPropertyNames(sockets).forEach(function(id) {
//      sockets[id].disconnect();
//    });

    process.exit(0);
  });
};
