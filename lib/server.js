var io = require('socket.io');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');
var reporter = require('./reporter');

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

  var resultReporter = new reporter.Progress();
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
      resultReporter.runStart(capturedBrowsers);
      socketServer.sockets.emit('execute', {});
    } else {
      log.debug('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
    }
  };

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers, resultReporter);

    socket.on('complete', function() {
      pendingCount--;

      if (!pendingCount) {
        resultReporter.runComplete(capturedBrowsers);

        // clean runner socket
        // TODO(vojta): create global event emitter, so that this piece of crap can be done
        // on "run_complete", registered when runner sends "run" command
        // That should also allows easier plugin registration, reporter might be just a plugin ?
        if (runnerSocket) {
          resultReporter.adapters.length = 1;
          runnerSocket.end();
          runnerSocket = null;
        }
      }
    });
  });

  fileGuardian.on('fileModified', function() {
    log.debug('Execution (fired by autoWatch)');
    tryExecution();
  });

  var runnerSocket = null;

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      log.debug('Execution (fired by runner)');

      runnerSocket = socket;
      resultReporter.adapters.push(socket.write.bind(socket));

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
