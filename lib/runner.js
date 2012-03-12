var net = require('net');
var PORT = 1337; // needs to be in sync with server config

exports.run = function(config) {
  var socket = net.connect(config.runnerPort || PORT);

  // TODO(vojta): error when no Testacular listening on this port
  socket.on('connect', function() {
    socket.write('run');
    socket.pipe(process.stdout);
  });

  socket.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('There is no server listening on port %d', config.runnerPort || PORT);
      process.exit(1);
    } else {
      throw e;
    }
  });
};
