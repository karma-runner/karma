var net = require('net');
var constant = require('./constants');

exports.run = function(config) {
  var port = config.runnerPort || constant.DEFAULT_RUNNER_PORT;
  var socket = net.connect(port);

  // TODO(vojta): error when no Testacular listening on this port
  socket.on('connect', function() {
    socket.pipe(process.stdout);
  });

  socket.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('There is no server listening on port %d', port);
      process.exit(1);
    } else {
      throw e;
    }
  });
};
