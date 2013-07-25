var http = require('http');

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


// TODO(vojta): read config file (port, host, urlRoot)
exports.run = function(config, done) {
  done = helper.isFunction(done) ? done : process.exit;

  var exitCode = 1;
  var options = {
    hostname: 'localhost',
    path: '/__run__',
    // TODO(vojta): remove runnerPort in 0.11
    port: config.port || config.runnerPort || constant.DEFAULT_PORT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var request = http.request(options, function(response) {
    response.on('data', function(buffer) {
      exitCode = parseExitCode(buffer, exitCode);
      if (!config.disableOutput) {
        process.stdout.write(buffer);
      }
    });

    response.on('end', function() {
      done(exitCode);
    });
  });

  request.on('error', function(e) {
    if (e.code === 'ECONNREFUSED') {
      console.error('There is no server listening on port %d', options.port);
      done(1);
    } else {
      throw e;
    }
  });

  request.end(JSON.stringify({args: config.clientArgs}));
};
