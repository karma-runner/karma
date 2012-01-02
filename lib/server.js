var io = require('socket.io'),
    net = require('net'),
    cfg = require('./config'),
    ws = require('./web-server'),
    logger = require('./logger'),
    browser = require('./browser');

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

  capturedBrowsers.on('change', function() {
    if (executionScheduled && capturedBrowsers.areAllReady()) {
      log.info('All browsers are ready, finally executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      socketServer.sockets.emit('execute');
    }

    // TODO(vojta): send only to interested browsers
    socketServer.sockets.emit('info', capturedBrowsers.serialize());
  });

  var tryExecution = function() {
    var nonReady = [];
    if (capturedBrowsers.areAllReady(nonReady)) {
      log.info('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      socketServer.sockets.emit('execute');
    } else {
      log.info('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
    }
  };

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers);
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
