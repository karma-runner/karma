var net = require('net');

var constant = require('./constants');
var helper = require('./helper');

var parseExitCode = function(buffer, defaultCode) {
  var tailPos = buffer.length - Buffer.byteLength(constant.EXIT_CODE) - 1;

  if (tailPos < 0) {
    return defaultCode;
  }

  // tail buffer which might contain the message
  var tail = buffer.slice(tailPos);
  var tailStr = tail.toString();
  if (tailStr.substr(0, tailStr.length - 1) === constant.EXIT_CODE) {
    tail.fill('\x00');
    return parseInt(tailStr.substr(-1), 10);
  }

  return defaultCode;
};


exports.run = function(config, done) {
  var port = config.runnerPort || constant.DEFAULT_RUNNER_PORT;
  var socket = net.connect(port);
  var exitCode = 1;

  // Make done callback optional so it's backwards compatible
  if (! helper.isFunction(done)) {
    done = process.exit;
  }

  // TODO(vojta): error when no Testacular listening on this port
  socket.on('data', function(buffer) {
    exitCode = parseExitCode(buffer, exitCode);
    process.stdout.write(buffer);
  });

  socket.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('There is no server listening on port %d', port);
      done(1);
    } else {
      throw e;
    }
  });

  socket.on('close', function() {
    done(exitCode);
  });
};
