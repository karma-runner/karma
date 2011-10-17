var net = require('net');

// communication runner - server
var PORT = 1337;

exports.run = function(files) {
  var socket = net.createConnection(PORT);

  socket.on('connect', function() {
//    socket.write(files.join(';'));
    socket.end('run');
  });
};
