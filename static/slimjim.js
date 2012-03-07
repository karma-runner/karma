var CONTEXT_URL = '/context.html';

// connect socket.io
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
var socket = io.connect(location, {
  'reconnection delay': 500,
  'reconnection limit': 2000,
  'max reconnection attempts': Infinity
});

socket.on('connect', function() {
  socket.emit('name', window.navigator.userAgent);
});

var browsersElement = document.getElementById('browsers');
socket.on('info', function(browsers) {
  var items = [];
  for (var i = 0; i < browsers.length; i++) {
    items.push(browsers[i].name + ' is ' + (browsers[i].isReady ? 'idle' : 'executing'));
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

socket.on('server_disconnect', function() {
  socket.socket.disconnect();
  socket.socket.reconnect();
});

var SlimJim = function(socket, context) {
  var config;
  var hasError = false;
  var store = {};

  // error during js file loading (most likely syntax error)
  // we are not going to execute at all
  this.error = function(msg, url, line) {
    hasError = true;
    socket.emit('error', msg + '\nat ' + url + ':' + line);
    this.complete();
    return true;
  };

  this.result = function(result) {
    socket.emit('result', result);
  };

  this.complete = function() {
    socket.emit('complete');
    context.src = 'about:blank';
  };

  this.info = function(info) {
    socket.emit('info', info);
  };

  // all files loaded, let's start the execution
  this.loaded = function() {
    // has error -> cancel
    if (!hasError) this.start(config);

    // remove reference to child iframe
    this.start = null;
  };

  this.store = function(key, value) {
    if (typeof value === 'undefined') {
      return store[key];
    }

    if (toString.apply(value) === '[object Array]') {
      var s = store[key] = [];
      for (var i = 0; i < value.length; i++) {
        s.push(value[i]);
      }
    } else {
      // TODO(vojta): clone objects + deep
      store[key] = value;
    }
  };

  // supposed to be overriden by the context
  // TODO(vojta): support multiple callbacks (queue)
  this.start = this.complete;

  socket.on('execute', function(cfg) {
    // reset hasError and reload the iframe
    hasError = false;
    config = cfg;
    context.src = CONTEXT_URL;
  });
};

// TODO(vojta): Wrap it into closure and add build
window.slimjim = new SlimJim(socket, document.getElementById('context'));
