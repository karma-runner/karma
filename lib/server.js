var io = require('socket.io');
var net = require('net');

var cfg = require('./config');
var ws = require('./web-server');
var logger = require('./logger');
var browser = require('./browser');
var reporter = require('./reporter');
var events = require('./events');
var constant = require('./constants');
var watcher = require('./watcher');
var preprocessor = require('./preprocessor');
var Launcher = require('./launcher').Launcher;
var FileList = require('./file-list').List;
var helper = require('./helper');

// TODO(vojta): get this whole mess under test
exports.start = function(cliOptions, done) {
  var config = cfg.parseConfig(cliOptions.configFile, cliOptions);

  // Make done callback optional so it's backwards compatible
  if (! helper.isFunction(done)) {
    done = process.exit;
  }
  
  logger.setup(config.logLevel, config.colors, config.loggers);

  var log = logger.create();
  var globalEmitter = new events.EventEmitter();
  var launcher = new Launcher(globalEmitter);

  var preprocess = preprocessor.createPreprocessor(config.preprocessors, config.basePath);
  var fileList = new FileList(config.files, config.exclude, globalEmitter, preprocess, 250);
  // TODO(vojta): wait for fileList resolving before serving first request...
  var filesPromise = fileList.refresh();

  if (config.autoWatch) {
    filesPromise.then(function() {
      watcher.watch(config.files, config.exclude, fileList);
    });
  }

  var webServer = ws.createWebServer(config.basePath, config.proxies, config.urlRoot);
  var socketServer = io.listen(webServer, {
    logger: logger.create('socket.io', constant.LOG_ERROR),
    resource: config.urlRoot + 'socket.io',
    transports: ['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling']
  });

  webServer.updateFilesPromise(filesPromise);

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
    log.info('Karma server started at http://' + config.hostname + ':' + config.port + config.urlRoot);

    if (config.browsers && config.browsers.length) {
      launcher.launch(config.browsers, config.hostname, config.port, config.urlRoot, config.captureTimeout, 3);
    }
  });

  var resultReporter = reporter.createReporters(config.reporters, config, globalEmitter);
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

    // TODO(vojta): This is lame, browser can get captured and then crash (before other browsers get
    // captured).
    if ((config.autoWatch || config.singleRun) && launcher.areAllCaptured()) {
      tryExecution();
    }
  });

  var tryExecution = function() {
    var nonReady = [];

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://' + config.hostname + ':' + config.port + config.urlRoot);
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

  globalEmitter.on('file_list_modified', function(filesPromise) {
    log.debug('Execution (fired by autoWatch)');
    webServer.updateFilesPromise(filesPromise);
    tryExecution();
  });


  // listen on port, waiting for runner
  var runnerServer = net.createServer(function (socket) {
    log.debug('Execution (fired by runner)');

    if (!capturedBrowsers.length) {
      log.warn('No captured browser, open http://' + config.hostname + ':' + config.port + config.urlRoot);
      socket.end('No captured browser, open http://' + config.hostname + ':' + config.port + config.urlRoot + '\n');
      return;
    }

    log.debug('Refreshing all the files / patterns');
    webServer.updateFilesPromise(fileList.refresh());

    globalEmitter.once('run_start', function() {
      var socketWrite = socket.write.bind(socket);

      resultReporter.addAdapter(socketWrite);

      // clean up, close runner socket
      globalEmitter.once('run_complete', function(browsers, results) {
        resultReporter.removeAdapter(socketWrite);
        socket.end(!results.exitCode && constant.EXIT_CODE_0);
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
    } else {
      throw e;
    }
  });

  runnerServer.listen(config.runnerPort);

  runnerServer.on('listening', function() {
    if (config.runnerPort !== constant.DEFAULT_RUNNER_PORT) {
      log.info('To run via this server, use "karma run --runner-port %d"', config.runnerPort);
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

    globalEmitter.emitAsync('exit').then(function() {
      done(code || 0);
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

  // Handle all unhandled exceptions, so we don't just exit but
  // disconnect the browsers before exiting.
  process.on('uncaughtException', function(error) {
    log.error(error);
    disconnectBrowsers(1);
  });
};
