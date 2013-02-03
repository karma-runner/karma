var CONTEXT_URL = 'context.html';

// connect socket.io
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
var testacularSrcPrefix = '%TESTACULAR_SRC_PREFIX%';
var socket = io.connect('http://' + location.host, {
  'reconnection delay': 500,
  'reconnection limit': 2000,
  'resource': testacularSrcPrefix + 'socket.io',
  'max reconnection attempts': Infinity
});

var browsersElement = document.getElementById('browsers');
socket.on('info', function(browsers) {
  var items = [], status;
  for (var i = 0; i < browsers.length; i++) {
    status = browsers[i].isReady ? 'idle' : 'executing';
    items.push('<li class="' + status + '">' + browsers[i].name + ' is ' + status + '</li>');
  }
  browsersElement.innerHTML = items.join('\n');
});
socket.on('disconnect', function() {
  browsersElement.innerHTML = '';
});

var titleElement = document.getElementById('title');
var bannerElement = document.getElementById('banner');
var updateStatus = function(status) {
  return function(param) {
    titleElement.innerHTML = 'Testacular - ' + (param ? status.replace('$', param) : status);
    bannerElement.className = status === 'connected' ? 'online' : 'offline';
  };
};

socket.on('connect', updateStatus('connected'));
socket.on('disconnect', updateStatus('disconnected'));
socket.on('reconnecting', updateStatus('reconnecting in $ ms...'));
socket.on('reconnect', updateStatus('re-connected'));
socket.on('reconnect_failed', updateStatus('failed to reconnect'));

var Testacular = function(socket, context, navigator, location) {
  var config;
  var hasError = false;
  var store = {};

  this.setupContext = function(contextWindow) {

    var getConsole = function(currentWindow) {
      return currentWindow.console || {
          log: function() {},
          warn: function() {},
          error: function() {},
          debug: function() {}
        };
    };

    contextWindow.__testacular__ = this;

    // This causes memory leak in Chrome (17.0.963.66)
    contextWindow.onerror = function() {
      return contextWindow.__testacular__.error.apply(contextWindow.__testacular__, arguments);
    };

    // patch the console
    var localConsole = contextWindow.console = getConsole(contextWindow);
    var browserConsoleLog = localConsole.log;

    localConsole.log = function() {
      contextWindow.__testacular__.info({dump: Array.prototype.slice.call(arguments, 0)});
      return browserConsoleLog.apply(localConsole, arguments);
    };
  };

  var clearContext = function() {
    context.src = 'about:blank';
  };

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

  this.complete = function(result) {
    socket.emit('complete', result);
    clearContext();
  };

  this.info = function(info) {
    socket.emit('info', info);
  };

  // all files loaded, let's start the execution
  this.loaded = function() {
    // has error -> cancel
    if (!hasError) {
      this.start(config);
    }

    // remove reference to child iframe
    this.start = null;
  };

  this.store = function(key, value) {
    if (typeof value === 'undefined') {
      return store[key];
    }

    if (Object.prototype.toString.apply(value) === '[object Array]') {
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

    // clear the console before run
    // works only on FF (Safari, Chrome do not allow to clear console from js source)
    if (window.console && window.console.clear) {
      window.console.clear();
    }
  });

  // cancel execution
  socket.on('disconnect', clearContext);

  // report browser name, id
  socket.on('connect', function() {
    socket.emit('register', {
      name: navigator.userAgent,
      id: parseInt((location.search.match(/\?id=(.*)/) || [])[1], 10) || null
    });
  });
};
