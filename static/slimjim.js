var CONTEXT_URL = '/context.html';

// connect socket.io
var socket = io.connect();

socket.on('connect', function() {
  socket.emit('name', window.navigator.userAgent);
});

var SlimJim = function(socket, context) {
  var hasError = false;

  // error during js file loading (most likely syntax error)
  // we are not going to execute at all
  this.error = function(msg, url, line) {
    hasError = true;
    socket.emit('error', msg + '\nat ' + url + ':' + line);
    socket.emit('complete');
    return true;
  };

  this.result = function(result) {
    socket.emit('result', result);
  };

  this.complete = function() {
    socket.emit('complete');
  };

  this.info = function(info) {
    socket.emit('info', info);
  };

  // all files loaded, let's start the execution
  this.loaded = function() {
    // has error -> cancel
    if (hasError) return;

    this.start();
  };

  // supposed to be overriden by the context
  // TODO(vojta): support multiple callbacks (queue)
  this.start = this.complete;

  socket.on('execute', function() {
    // reset hasError and reload the iframe
    hasError = false;
    context.src = CONTEXT_URL;
  });
};

var slimjim = new SlimJim(socket, document.getElementById('context'));
