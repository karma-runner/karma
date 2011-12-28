var io = require('socket.io'),
    net = require('net'),
    cfg = require('./config'),
    ws = require('./web-server'),
    logger = require('./logger');

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
    var name;
    log.info('NEW BROWSER');
    socket.on('result', function (result) {
      log.info('RESULT: ', result);
    });

    socket.on('disconnect', function() {
      log.warn('Browser disconnected:', name);
    });

    socket.on('name', function(_name) {
      name = _name;
      log.info('Browser name:', name);
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
