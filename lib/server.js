var io = require('socket.io'),
    net = require('net'),
    cfg = require('./config'),
    ws = require('./web-server');

exports.start = function(configFilePath) {
  var config = cfg.parseConfig(configFilePath);
  var fileGuardian = new cfg.FileGuardian(config.files);
  var webServer = ws.createWebServer(fileGuardian);
  var socketServer = io.listen(webServer);

  socketServer.set('log level', 1);
  webServer.listen(config.port);

  // socket to captured browsers
  socketServer.sockets.on('connection', function (socket) {
    var name;
    console.log('new browser');
    socket.on('result', function (result) {
      console.log('RESULT: ', result);
    });

    socket.on('disconnect', function() {
      console.log('browser disconnected ', name);
    });

    socket.on('name', function(_name) {
      name = _name;
      console.log('with name ', name);
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
