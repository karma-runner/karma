var io = require('socket.io');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');

var STATIC_FOLDER = __dirname + '/../static/';

exports.start = function(configFilePath) {
  var config = cfg.parseConfig(configFilePath);

  logger.setLevel(config.logLevel);
  logger.useColors(config.logColors);

  var log = logger.create();
  var fileGuardian = new cfg.FileGuardian(config.files, config.autoWatch);
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
    executionScheduled  && tryExecution();

    // TODO(vojta): send only to interested browsers
    socketServer.sockets.emit('info', capturedBrowsers.serialize());
  });

  var tryExecution = function() {
    var nonReady = [];
    if (capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      capturedBrowsers.clearResults();
      pendingCount = capturedBrowsers.length;
      socketServer.sockets.emit('execute');
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

      if (!pendingCount) {
        var results = capturedBrowsers.getResults();
        log.info('TOTAL FAILED: %d PASSED: %d', results.failed, results.success);
      }
    });
  });

  fileGuardian.on('fileModified', function() {
    log.info('Execution (fired by autoWatch)');
    tryExecution();
  });

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      log.info('Execution (fired by runner)');
      fileGuardian.checkModifications();
      tryExecution();
    });
  }).listen(config.runnerPort);
};
