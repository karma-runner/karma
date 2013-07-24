var io = require('socket.io');
var net = require('net');
var di = require('di');

var cfg = require('./config');
var logger = require('./logger');
var browser = require('./browser');
var constant = require('./constants');
var watcher = require('./watcher');
var plugin = require('./plugin');

var ws = require('./web-server');
var preprocessor = require('./preprocessor');
var Launcher = require('./launcher').Launcher;
var FileList = require('./file-list').List;
var reporter = require('./reporter');
var helper = require('./helper');
var EventEmitter = require('./events').EventEmitter;

var log = logger.create();


// TODO(vojta): get this whole mess under test
var start = function(injector, config, launcher, globalEmitter, preprocess, fileList, webServer,
    resultReporter, capturedBrowsers, done) {

  config.frameworks.forEach(function(framework) {
    injector.get('framework:' + framework);
  });

  var filesPromise = fileList.refresh();

  if (config.autoWatch) {
    filesPromise.then(function() {
      injector.invoke(watcher.watch);
    });
  }

  // TODO(vojta): instantiate by DI
  var socketServer = io.listen(webServer, {
    logger: logger.create('socket.io', constant.LOG_ERROR),
    resource: config.urlRoot + 'socket.io',
    transports: config.transports
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
    log.info('Karma v%s server started at http://%s:%s%s', constant.VERSION, config.hostname,
        config.port, config.urlRoot);

    if (config.browsers && config.browsers.length) {
      injector.invoke(launcher.launch, launcher);
    }
  });

  var executionScheduled = false;
  var pendingCount = 0;
  var runningBrowsers;
  var clientConfig = {args: config.clientArgs};

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
      log.warn('No captured browser, open http://%s:%s%s', config.hostname, config.port,
          config.urlRoot);
      return false;
    } else if (capturedBrowsers.areAllReady(nonReady)) {
      log.debug('All browsers are ready, executing');
      executionScheduled = false;
      capturedBrowsers.setAllIsReadyTo(false);
      capturedBrowsers.clearResults();
      pendingCount = capturedBrowsers.length;
      runningBrowsers = capturedBrowsers.clone();
      globalEmitter.emit('run_start', runningBrowsers);
      socketServer.sockets.emit('execute', clientConfig);
      return true;
    } else {
      log.info('Delaying execution, these browsers are not ready: ' + nonReady.join(', '));
      executionScheduled = true;
      return false;
    }
  };

  globalEmitter.on('browser_complete', function() {
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
    log.debug('List of files has changed, trying to execute');
    webServer.updateFilesPromise(filesPromise);
    tryExecution();
  });


  // listen on port, waiting for runner
  var runnerServer = net.createServer(function (socket) {
    var buf = '';
    socket.on('data', function(data) {
      buf += data;

      // data is followed by a NUL byte, so keep buffering until that's present
      if (buf[buf.length - 1] !== '\0') {
        return;
      }

      // strip the NUL byte and parse
      clientConfig = JSON.parse(buf.substr(0, buf.length - 1));
      buf = '';
      log.debug('Execution (fired by runner)');

      if (!capturedBrowsers.length) {
        var url = 'http://' + config.hostname + ':' + config.port + config.urlRoot;

        log.warn('No captured browser, open ' + url);
        socket.end('No captured browser, open ' + url + '\n');
        return;
      }

      if (!capturedBrowsers.areAllReady([])) {
        socket.write('Waiting for previous execution...\n');
      }

      globalEmitter.once('run_start', function() {
        var socketWrite = socket.write.bind(socket);

        resultReporter.addAdapter(socketWrite);

        // clean up, close runner socket
        globalEmitter.once('run_complete', function(browsers, results) {
          resultReporter.removeAdapter(socketWrite);
          socket.end(constant.EXIT_CODE + results.exitCode);
        });
      });

      log.debug('Refreshing all the files / patterns');
      fileList.refresh();
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
start.$inject = ['injector', 'config', 'launcher', 'emitter', 'preprocess', 'fileList',
    'webServer', 'reporter', 'capturedBrowsers', 'done'];


exports.start = function(cliOptions, done) {
  // apply the default logger config as soon as we can
  logger.setup(constant.LOG_INFO, true, [constant.CONSOLE_APPENDER]);

  var config = cfg.parseConfig(cliOptions.configFile, cliOptions);
  var modules = [{
    helper: ['value', helper],
    logger: ['value', logger],
    done: ['value', done || process.exit],
    emitter: ['type', EventEmitter],
    launcher: ['type', Launcher],
    config: ['value', config],
    preprocess: ['factory', preprocessor.createPreprocessor],
    fileList: ['type', FileList],
    webServer: ['factory', ws.createWebServer],
    customFileHandlers: ['value', []],
    customScriptTypes: ['value', []],
    reporter: ['factory', reporter.createReporters],
    capturedBrowsers: ['type', browser.Collection],
    args: ['value', {}]
  }];

  // load the plugins
  modules = modules.concat(plugin.resolve(config.plugins));

  var injector = new di.Injector(modules);

  injector.invoke(start);
};
