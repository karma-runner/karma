var stringify = require('./stringify');
var constant = require('./constants');
var util = require('./util');


/* jshint unused: false */
var Karma = function(socket, context, navigator, location) {
  var hasError = false;
  var startEmitted = false;
  var store = {};
  var self = this;
  var queryParams = util.parseQueryParams(location.search);
  var browserId = queryParams.id || util.generateId('manual-');
  var returnUrl = queryParams.return_url || null;

  var resultsBufferLimit = 1;
  var resultsBuffer = [];

  this.VERSION = constant.VERSION;
  this.config = {};

  this.setupContext = function(contextWindow) {
    if (hasError) {
      return;
    }

    var getConsole = function(currentWindow) {
      return currentWindow.console || {
          log: function() {},
          info: function() {},
          warn: function() {},
          error: function() {},
          debug: function() {}
        };
    };

    contextWindow.__karma__ = this;

    // This causes memory leak in Chrome (17.0.963.66)
    contextWindow.onerror = function() {
      return contextWindow.__karma__.error.apply(contextWindow.__karma__, arguments);
    };

    contextWindow.onbeforeunload = function(e, b) {
      if (context.src !== 'about:blank') {
        // TODO(vojta): show what test (with explanation about jasmine.UPDATE_INTERVAL)
        contextWindow.__karma__.error('Some of your tests did a full page reload!');
      }
    };

    // patch the console
    var localConsole = contextWindow.console = getConsole(contextWindow);
    var browserConsoleLog = localConsole.log;
    var logMethods = ['log', 'info', 'warn', 'error', 'debug'];
    var patchConsoleMethod = function(method) {
      var orig = localConsole[method];
      if (!orig) {
        return;
      }
      localConsole[method] = function() {
        self.log(method, arguments);
        return Function.prototype.apply.call(orig, localConsole, arguments);
      };
    };
    for (var i = 0; i < logMethods.length; i++) {
      patchConsoleMethod(logMethods[i]);
    }

    contextWindow.dump = function() {
      self.log('dump', arguments);
    };

    contextWindow.alert = function(msg) {
      self.log('alert', [msg]);
    };
  };

  this.log = function(type, args) {
    var values = [];

    for (var i = 0; i < args.length; i++) {
      values.push(this.stringify(args[i], 3));
    }

    this.info({log: values.join(', '), type: type});
  };

  this.stringify = stringify;


  var clearContext = function() {
    context.src = 'about:blank';
  };

  // error during js file loading (most likely syntax error)
  // we are not going to execute at all
  this.error = function(msg, url, line) {
    hasError = true;
    socket.emit('error', url ? msg + '\nat ' + url + (line ? ':' + line : '') : msg);
    this.complete();
    return false;
  };

  this.result = function(result) {
    if (!startEmitted) {
      socket.emit('start', {total: null});
      startEmitted = true;
    }

    if (resultsBufferLimit === 1) {
      return socket.emit('result', result);
    }

    resultsBuffer.push(result);

    if (resultsBuffer.length === resultsBufferLimit) {
      socket.emit('result', resultsBuffer);
      resultsBuffer = [];
    }
  };

  this.complete = function(result) {
    if (resultsBuffer.length) {
      socket.emit('result', resultsBuffer);
      resultsBuffer = [];
    }

    // give the browser some time to breath, there could be a page reload, but because a bunch of
    // tests could run in the same event loop, we wouldn't notice.
    setTimeout(function() {
      socket.emit('complete', result || {});
      if (returnUrl) {
        socket.disconnect();
        location.href = returnUrl;
      } else {
        clearContext();
      }
    }, 0);
  };

  this.info = function(info) {
    // TODO(vojta): introduce special API for this
    if (!startEmitted && util.isDefined(info.total)) {
      socket.emit('start', info);
      startEmitted = true;
    } else {
      socket.emit('info', info);
    }
  };

  // all files loaded, let's start the execution
  this.loaded = function() {
    // has error -> cancel
    if (!hasError) {
      this.start(this.config);
    }

    // remove reference to child iframe
    this.start = null;
  };

  this.store = function(key, value) {
    if (util.isUndefined(value)) {
      return store[key];
    }

    if (util.instanceOf(value, 'Array')) {
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
  this.start = function() {
    this.error('You need to include some adapter that implements __karma__.start method!');
  };

  socket.on('execute', function(cfg) {
    // reset hasError and reload the iframe
    hasError = false;
    startEmitted = false;
    self.config = cfg;
    context.src = constant.CONTEXT_URL;

    // clear the console before run
    // works only on FF (Safari, Chrome do not allow to clear console from js source)
    if (window.console && window.console.clear) {
      window.console.clear();
    }
  });

  // report browser name, id
  socket.on('connect', function() {
    var transport = socket.socket.transport.name;

    // TODO(vojta): make resultsBufferLimit configurable
    if (transport === 'websocket' || transport === 'flashsocket') {
      resultsBufferLimit = 1;
    } else {
      resultsBufferLimit = 50;
    }

    socket.emit('register', {
      name: navigator.userAgent,
      id: browserId
    });
  });
};

module.exports = Karma;
