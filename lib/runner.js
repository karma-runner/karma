var net = require('net');
var constant = require('./constants');

var parseExitCode = function(buffer, defaultCode) {
  // tail buffer which might contain the message
  var tail = buffer.slice(buffer.length - Buffer.byteLength(constant.EXIT_CODE_0));

    if (tail.toString() === constant.EXIT_CODE_0) {
      tail.fill('\000');
      return 0;
    }

    return defaultCode;
};


exports.run = function(config) {
  var port = config.runnerPort || constant.DEFAULT_RUNNER_PORT;
  var socket = net.connect(port);
  var exitCode = 1;

  // TODO(vojta): error when no Testacular listening on this port
  socket.on('data', function(buffer) {
    exitCode = parseExitCode(buffer, exitCode);
    process.stdout.write(buffer);
  });

  socket.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('There is no server listening on port %d', port);
      process.exit(1);
    } else {
      throw e;
    }
  });

  socket.on('end', function() {
    process.exit(exitCode);
  });
};
