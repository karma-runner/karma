var http = require('http'),
    io = require('socket.io'),
    fs = require('fs'),
    net = require('net'),
    vm = require('vm'),
    path = require('path');

var PORTS = [1337, 8080];

function handler (req, res) {
  var file = req.url == '/' ? __dirname + '/../static/client.html' : req.url.replace(/\?.*/, '');
  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading file...');
    }

    res.writeHead(200);
    return res.end(data);
  });
}

exports.start = function(configFile) {
  var webServer = http.createServer(handler);
  var socketServer = io.listen(webServer);

  // parse configuration
  // TODO(vojta): handle non-existing config file
  // TODO(vojta): handle invalid config file
  // TODO(vojta): allow expressions, like src/*.js
  var config = {files: []};
  vm.runInNewContext(fs.readFileSync(configFile), config);
  config.include.forEach(function(exp) {
    config.files.push(path.resolve(path.dirname(configFile), exp));
  });

  socketServer.set('log level', 1);
  webServer.listen(PORTS[1]);

  // socket to captured browsers
  socketServer.sockets.on('connection', function (socket) {
    console.log('new browser');
    socket.on('result', function (result) {
      console.log('RESULT: ', result);
    });
  });

  // listen on port, waiting for runner
  net.createServer(function (socket) {
    socket.on('data', function(buffer) {
      socketServer.sockets.emit('execute', config.files);
    });
  }).listen(PORTS[0]);
};
