var net = require('net');
var PORT = 1337; // needs to be in sync with server config

exports.run = function(config) {
  var socket = net.connect(config.runnerPort || PORT, function() {
    socket.write('run');
    socket.pipe(process.stdout);
  });
};
