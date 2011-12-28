var io = require('socket.io'),
    net = require('net'),
    cfg = require('./config'),
    ws = require('./web-server'),
    logger = require('./logger'),
    util = require('./util');

var STATIC_FOLDER = __dirname + '/../static/';

exports.start = function(configFilePath) {
  var config = cfg.parseConfig(configFilePath);

  logger.setLevel(config.logLevel);
  logger.useColors(config.logColors);

  var log = logger.create();
  var fileGuardian = new cfg.FileGuardian(config.files, config.autoWatch);
  log.info('Starting web server at http://localhost:' + config.port);
  var webServer = ws.createWebServer(fileGuardian, STATIC_FOLDER).listen(config.port);
  var socketServer = io.listen(webServer, {logger: logger.create('socket.io', 0)});


  // socket to captured browsers
  socketServer.sockets.on('connection', function (socket) {
    var browserName;
    log.debug('New browser has connected.');

    socket.on('result', function (result) {
      log.info('RESULT: ', result);
    });

    socket.on('disconnect', function() {
      log.warn('Browser disconnected:', browserName);
    });

    socket.on('name', function(name) {
      browserName = util.browserFullNameToShort(name);
      log.info('New browser:', browserName);
    });
  });

  fileGuardian.on('fileModified', function() {
    log.info('Execution (fired by autoWatch)');
    socketServer.sockets.emit('execute');
  });

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      fileGuardian.checkModifications();
      log.info('Execution (fired by runner)');
      socketServer.sockets.emit('execute');
    });
  }).listen(config.runnerPort);
};
