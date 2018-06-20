// Load our dependencies
var stringify = require('../common/stringify')

// Define our context Karma constructor
function ContextKarma (callParentKarmaMethod) {
  // Define local variables
  var hasError = false
  var self = this

  // Define our loggers
  // DEV: These are intentionally repeated in client and context
  this.log = function (type, args) {
    var values = []

    for (var i = 0; i < args.length; i++) {
      values.push(this.stringify(args[i], 3))
    }

    this.info({log: values.join(', '), type: type})
  }

  this.stringify = stringify

  // Define our proxy error handler
  // DEV: We require one in our context to track `hasError`
  this.error = function () {
    hasError = true
    callParentKarmaMethod('error', [].slice.call(arguments))
    return false
  }

  // Define our start handler
  function UNIMPLEMENTED_START () {
    this.error('You need to include some adapter that implements __karma__.start method!')
  }
  // all files loaded, let's start the execution
  this.loaded = function () {
    // has error -> cancel
    if (!hasError) {
      this.start(this.config)
    }

    // remove reference to child iframe
    this.start = UNIMPLEMENTED_START
  }
  // supposed to be overriden by the context
  // TODO(vojta): support multiple callbacks (queue)
  this.start = UNIMPLEMENTED_START

  // Define proxy methods
  // DEV: This is a closured `for` loop (same as a `forEach`) for IE support
  var proxyMethods = ['complete', 'info', 'result']
  for (var i = 0; i < proxyMethods.length; i++) {
    (function bindProxyMethod (methodName) {
      self[methodName] = function boundProxyMethod () {
        callParentKarmaMethod(methodName, [].slice.call(arguments))
      }
    }(proxyMethods[i]))
  }

  // Define bindings for context window
  this.setupContext = function (contextWindow) {
    // If we clear the context after every run and we already had an error
    //   then stop now. Otherwise, carry on.
    if (self.config.clearContext && hasError) {
      return
    }

    // Perform window level bindings
    // DEV: We return `self.error` since we want to `return false` to ignore errors
    contextWindow.onerror = function () {
      return self.error.apply(self, arguments)
    }
    // DEV: We must defined a function since we don't want to pass the event object
    contextWindow.onbeforeunload = function (e, b) {
      callParentKarmaMethod('onbeforeunload', [])
    }

    contextWindow.dump = function () {
      self.log('dump', arguments)
    }

    var _confirm = contextWindow.confirm
    var _prompt = contextWindow.prompt

    contextWindow.alert = function (msg) {
      self.log('alert', [msg])
    }

    contextWindow.confirm = function (msg) {
      self.log('confirm', [msg])
      return _confirm(msg)
    }

    contextWindow.prompt = function (msg, defaultVal) {
      self.log('prompt', [msg, defaultVal])
      return _prompt(msg, defaultVal)
    }

    // If we want to overload our console, then do it
    function getConsole (currentWindow) {
      return currentWindow.console || {
        log: function () {},
        info: function () {},
        warn: function () {},
        error: function () {},
        debug: function () {}
      }
    }
    if (self.config.captureConsole) {
      // patch the console
      var localConsole = contextWindow.console = getConsole(contextWindow)
      var logMethods = ['log', 'info', 'warn', 'error', 'debug']
      var patchConsoleMethod = function (method) {
        var orig = localConsole[method]
        if (!orig) {
          return
        }
        localConsole[method] = function () {
          self.log(method, arguments)
          return Function.prototype.apply.call(orig, localConsole, arguments)
        }
      }
      for (var i = 0; i < logMethods.length; i++) {
        patchConsoleMethod(logMethods[i])
      }
    }
  }
}

// Define call/proxy methods
ContextKarma.getDirectCallParentKarmaMethod = function (parentWindow) {
  return function directCallParentKarmaMethod (method, args) {
    // If the method doesn't exist, then error out
    if (!parentWindow.karma[method]) {
      parentWindow.karma.error('Expected Karma method "' + method + '" to exist but it doesn\'t')
      return
    }

    // Otherwise, run our method
    parentWindow.karma[method].apply(parentWindow.karma, args)
  }
}
ContextKarma.getPostMessageCallParentKarmaMethod = function (parentWindow) {
  return function postMessageCallParentKarmaMethod (method, args) {
    parentWindow.postMessage({__karmaMethod: method, __karmaArguments: args}, window.location.origin)
  }
}

// Export our module
module.exports = ContextKarma
