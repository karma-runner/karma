var CONTEXT_URL = '/context.html';

// connect socket.io
var socket = io.connect();

socket.on('connect', function() {
  socket.emit('name', window.navigator.userAgent);
});

var browsersElement = document.getElementById('browsers');
socket.on('info', function(browsers) {
  var items = [];
  for (var i = 0; i < browsers.length; i++) {
    items.push(browsers[i].name + ' is ' + (browsers[i].isReady ? 'iddle' : 'executing'));
  }
  browsersElement.innerHTML = '<li>' + items.join('</li><li>') + '</li>';
});

var statusElement = document.getElementById('status');
var updateStatus = function(status) {
  return function(param) {
    statusElement.innerHTML = param ? status.replace('$', param) : status;
  };
};

socket.on('connect', updateStatus('connected'));
socket.on('disconnect', updateStatus('disconnected'));
socket.on('reconnecting', updateStatus('reconnecting in $ ms...'));
socket.on('reconnect', updateStatus('re-connected'));
socket.on('reconnect_failed', updateStatus('failed to reconnect'));


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
    if (!hasError) this.start();
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
