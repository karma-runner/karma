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
var Launcher = require('./launcher').Launcher;
var FileList = require('./file-list').List;
var watcher = require('./watcher');
var preprocessor = require('./preprocessor');


// TODO(vojta): get this whole mess under test
exports.start = function(cliOptions) {
  var config = cfg.parseConfig(cliOptions.configFile, cliOptions);


  logger.setLevel(config.logLevel);
  logger.useColors(config.colors);

  var log = logger.create();
  var globalEmitter = new events.EventEmitter();
  var launcher = new Launcher(globalEmitter);

  var preprocess = preprocessor.createPreprocessor(config.preprocessors, config.basePath);
  var fileList = new FileList(config.files, config.exclude, globalEmitter, preprocess);
  // TODO(vojta): wait for fileList resolving before serving first request...
  fileList.refresh(function() {
    if (config.autoWatch) {
      watcher.watch(config.files, fileList);
    }
  });

  var webServer = ws.createWebServer(fileList, config.basePath, config.proxies, config.urlRoot);
  var socketServer = io.listen(webServer, {
    logger: logger.create('socket.io', 0),
    resource: config.urlRoot + 'socket.io',
    transports: ['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling']
  });

  webServer.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      log.warn('Port %d in use', config.port);
      config.port++;
      webServer.listen(config.port);
    } else {
      throw e;
    }
  });

  webServer.listen(config.port, function() {
    log.info('Testacular server started at http://localhost:' + config.port + config.urlRoot);

    if (config.browsers && config.browsers.length) {
      launcher.launch(config.browsers, config.port, config.urlRoot, config.captureTimeout, 3);
    }
  });

  var resultReporter = reporter.createReporters(config.reporters, config);
  resultReporter.reporters.forEach(function(reporter) {
    globalEmitter.bind(reporter);
  });

  var capturedBrowsers = new browser.Collection(globalEmitter);
  var executionScheduled = false;
  var pendingCount = 0;
  var runningBrowsers;

  globalEmitter.on('browsers_change', function() {
    // TODO(vojta): send only to interested browsers
    socketServer.sockets.emit('info', capturedBrowsers.serialize());
  });

  globalEmitter.on('browser_register', function(browser) {
    if (browser.launchId) {
      launcher.markCaptured(browser.launchId);
    }

    if ((config.autoWatch || config.singleRun) && launcher.areAllCaptured()) {
      tryExecution();
    }
  });

  var tryExecution = function() {
    var nonReady = [];

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://localhost:' + config.port + config.urlRoot);
      return false;
    } else if (capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      capturedBrowsers.clearResults();
      pendingCount = capturedBrowsers.length;
      runningBrowsers = capturedBrowsers.clone();
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
      globalEmitter.emit('run_complete', runningBrowsers, runningBrowsers.getResults());
    }
  });

  globalEmitter.on('run_complete', function(browsers, results) {
    if (config.singleRun) {
        disconnectBrowsers(results.exitCode);
    } else if (executionScheduled) {
      tryExecution();
    }
  });

  socketServer.sockets.on('connection', function (socket) {
    log.debug('New browser has connected on socket ' + socket.id);
    browser.createBrowser(socket, capturedBrowsers, globalEmitter);
  });

  globalEmitter.on('file_list_modified', function() {
    log.debug('Execution (fired by autoWatch)');
    tryExecution();
  });


  // listen on port, waiting for runner
  var runnerServer = net.createServer(function (socket) {
    log.debug('Execution (fired by runner)');

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://localhost:' + config.port + config.urlRoot);
      socket.end('No captured browser, open http://localhost:' + config.port + config.urlRoot + '\n');
      return;
    }

    // TODO(vojta): we should immediately fire run, but delay serving the context.html
    log.debug('Refreshing all the files / patterns');
    fileList.refresh(function() {
      if (!tryExecution()) {
        socket.write('Waiting for previous execution...\n');
      }
    });

    globalEmitter.once('run_start', function() {
      var socketWrite = socket.write.bind(socket);

      resultReporter.addAdapter(socketWrite);

      // clean up, close runner socket
      globalEmitter.once('run_complete', function(browsers, results) {
        resultReporter.removeAdapter(socketWrite);
        socket.end(!results.exitCode && constant.EXIT_CODE_0);
      });
    });
  });

  runnerServer.on('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      log.warn('Port %d in use', config.runnerPort);
      config.runnerPort++;
      runnerServer.listen(config.runnerPort);
    } else {
      throw e;
    }
  });

  runnerServer.listen(config.runnerPort);

  runnerServer.on('listening', function() {
    if (config.runnerPort !== constant.DEFAULT_RUNNER_PORT) {
      log.info('To run via this server, use "testacular run --runner-port %d"', config.runnerPort);
    }
  });

  var disconnectBrowsers = function(code) {
    // Slightly hacky way of removing disconnect listeners
    // to suppress "browser disconnect" warnings
    // TODO(vojta): change the client to not send the event (if disconnected by purpose)
    var sockets = socketServer.sockets.sockets;
    Object.getOwnPropertyNames(sockets).forEach(function(key) {
      sockets[key].removeAllListeners('disconnect');
    });


    log.info('Disconnecting all browsers');
    log.debug('Waiting for child processes to finish');
    launcher.kill(function() {
      process.exit(code || 0);
    });
  };


  if (config.singleRun) {
    globalEmitter.on('browser_process_failure', function(browser) {
      log.debug('%s failed to capture, aborting the run.', browser);
      disconnectBrowsers(1);
    });
  }

  try {
    process.on('SIGINT', disconnectBrowsers);
    process.on('SIGTERM', disconnectBrowsers);
  } catch (e) {
    // Windows doesn't support signals yet, so they simply don't get this handling.
    // https://github.com/joyent/node/issues/1553
  }
};
