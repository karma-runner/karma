var io = require('socket.io');
var net = require('net');
var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');
var reporter = require('./reporter');
var events = require('./events');
var util = require('./util');
var constant = require('./constants');

var STATIC_FOLDER = __dirname + '/../static';

// TODO(vojta): get this whole mess under test
exports.start = function(configFilePath, cliOptions) {
  var config = cfg.parseConfig(configFilePath, cliOptions);

  logger.setLevel(config.logLevel);
  logger.useColors(config.logColors);

  var log = logger.create();
  var globalEmitter = new events.EventEmitter();
  var fileGuardian = new cfg.FileGuardian(config.files, config.exclude, globalEmitter, config.autoWatch, config.autoWatchInterval);

  var webServer = ws.createWebServer(fileGuardian, STATIC_FOLDER);
  var socketServer = io.listen(webServer, {
    logger: logger.create('socket.io', 0),
    transports: ['websocket', 'xhr-polling', 'jsonp-polling']
  });

  webServer.on('listening', function() {
    log.info('Web server started at http://localhost:' + config.port);
  });

  webServer.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      log.warn('Port %d in use', config.port);
      config.port++;
      webServer.listen(config.port);
    } else throw e;
  });

  webServer.listen(config.port);

  var resultReporter = new reporter.Progress();
  globalEmitter.bind(resultReporter);

  var capturedBrowsers = new browser.Collection(globalEmitter);
  var executionScheduled = false;
  var pendingCount = 0;
  var runningBrowsers;

  globalEmitter.on('browsers_change', function() {
    // TODO(vojta): send only to interested browsers
    socketServer.sockets.emit('info', capturedBrowsers.serialize());
  });

  var tryExecution = function() {
    var nonReady = [];

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://localhost:' + config.port);
      return false;
    } else if (capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      capturedBrowsers.clearResults();
      pendingCount = capturedBrowsers.length;
      runningBrowsers = capturedBrowsers.toArray();
      globalEmitter.emit('run_start', runningBrowsers);
      socketServer.sockets.emit('execute', {});
      return true;
    } else {
      log.info('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
      return false;
    }
  };

  globalEmitter.on('browser_complete', function(browser) {
    pendingCount--;

    if (!pendingCount) {
      // TODO(vojta): change runningBrowsers to collection and put getResults() there
      globalEmitter.emit('run_complete', runningBrowsers, capturedBrowsers.getResults());
    }
  });

  globalEmitter.on('run_complete', function() {
    if (executionScheduled) tryExecution();
  });

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers, globalEmitter);
  });

  globalEmitter.on('file_modified', function() {
    log.debug('Execution (fired by autoWatch)');
    tryExecution();
  });


  // listen on port, waiting for runner
  var runnerServer = net.createServer(function (socket) {
    log.debug('Execution (fired by runner)');

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://localhost:' + config.port);
      socket.end('No captured browser, open http://localhost:' + config.port + '\n');
      return;
    }

    // TODO(vojta): this should delay web server (when serving context.html), if necesarry
    fileGuardian.checkModifications();

    globalEmitter.once('run_start', function() {
      var socketWrite = socket.write.bind(socket);

      resultReporter.adapters.push(socketWrite);

      // clean up, close runner socket
      globalEmitter.once('run_complete', function(browsers, results) {
        // get the exit code
        // 0 - success (all executed tests passed, no disconnected browser, no error)
        // 1 - otherwise
        // TODO(vojta): move this logic into getResults()
        var code = browsers.reduce(function(code, browser) {
          var lastResults = browser.lastResult;
          return (lastResults.failed || lastResults.disconnected || lastResults.error) ? 1 : code;
        }, 0);

        util.arrayRemove(resultReporter.adapters, socketWrite);
        socket.end(!code && constant.EXIT_CODE_0);
      });
    });

    if (!tryExecution()) {
      socket.write('Waiting for previous execution...\n');
    }
  });

  runnerServer.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      log.warn('Port %d in use', config.runnerPort);
      config.runnerPort++;
      runnerServer.listen(config.runnerPort);
    } else throw e;
  });

  runnerServer.listen(config.runnerPort);

  runnerServer.on('listening', function() {
    if (config.runnerPort !== constant.DEFAULT_RUNNER_PORT) {
      log.info('To run via this server, use "testacular-run --runner-port %d"', config.runnerPort);
    }
  });


  var disconnectBrowsers = function() {
    log.warn('Disconnecting all browsers');
    socketServer.sockets.emit('server_disconnect');
    process.exit(0);
  };

  process.on('SIGINT', disconnectBrowsers);
  process.on('SIGTERM', disconnectBrowsers);
};
