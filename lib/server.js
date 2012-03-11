var io = require('socket.io');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');
var reporter = require('./reporter');
var emitter = require('./emitter');

var STATIC_FOLDER = __dirname + '/../static';

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

  var globalEmitter = new emitter.EventEmitter();
  var resultReporter = new reporter.Progress();
  globalEmitter.bind(resultReporter);

  var capturedBrowsers = new browser.Collection(globalEmitter);
  var executionScheduled = false;
  var pendingCount = 0;

  globalEmitter.on('browsers_change', function() {
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
      globalEmitter.emit('run_start', capturedBrowsers);
      socketServer.sockets.emit('execute', {});
    } else {
      log.debug('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
    }
  };

  globalEmitter.on('browser_complete', function(browser) {
    pendingCount--;

    if (!pendingCount) {
      globalEmitter.emit('run_complete', capturedBrowsers);
    }
  });

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers, globalEmitter);
  });

  fileGuardian.on('fileModified', function() {
    log.debug('Execution (fired by autoWatch)');
    tryExecution();
  });


  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      log.debug('Execution (fired by runner)');
      resultReporter.adapters.push(socket.write.bind(socket));

      // clean up, close runner socket
      globalEmitter.once('run_complete', function() {
        resultReporter.adapters.length = 1;
        socket.end();
      })

      // TODO(vojta): this should delay web server (when serving context.html), if necesarry
      fileGuardian.checkModifications();
      tryExecution();
    });
  }).listen(config.runnerPort);

  var disconnectBrowsers = function() {
    log.warn('Disconnecting all browsers');
    socketServer.sockets.emit('server_disconnect');
    process.exit(0);
  };

  process.on('SIGINT', disconnectBrowsers);
  process.on('SIGTERM', disconnectBrowsers);
};
