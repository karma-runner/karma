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

  var fileGuardian = new cfg.FileGuardian(config.files);
  var webServer = ws.createWebServer(fileGuardian, STATIC_FOLDER).listen(config.port);
  var socketServer = io.listen(webServer, {logger: logger.create('socket.io', 0)});
  var log = logger.create('global');

  // socket to captured browsers
  socketServer.sockets.on('connection', function (socket) {
    var name;
    log.info('new browser');
    socket.on('result', function (result) {
      log.info('RESULT: ', result);
    });

    socket.on('disconnect', function() {
      log.warn('browser disconnected ', name);
    });

    socket.on('name', function(_name) {
      name = _name;
      log.info('with name ', name);
    });
  });

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      fileGuardian.checkModifications();
      socketServer.sockets.emit('execute');
    });
  }).listen(config.runnerPort);
};
