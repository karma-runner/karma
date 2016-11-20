// Load our dependencies
import {stringify} from '../common/stringify'

// Define our context Karma constructor
export class ContextKarma {

  private hasError = false
  config;

  constructor(private callParentKarmaMethod) {
    // Define proxy methods
    // DEV: This is a closured `for` loop (same as a `forEach`) for IE support
    var proxyMethods = ['complete', 'info', 'result']
    for (var i = 0; i < proxyMethods.length; i++) {
      ((methodName) => {
        this[methodName] = function boundProxyMethod() {
          callParentKarmaMethod(methodName, [].slice.call(arguments))
        }
      })(proxyMethods[i])
    }
  }

  // Define our loggers
  // DEV: These are intentionally repeated in client and context
  log = (type, args) => {
    var values = []

    for (var i = 0; i < args.length; i++) {
      values.push(this.stringify(args[i], 3))
    }

    this.info({log: values.join(', '), type: type})
  }

  stringify = stringify

  // Define our proxy error handler
  // DEV: We require one in our context to track `hasError`
  error = (..._arguments) => {
    this.hasError = true
    this.callParentKarmaMethod('error', [].slice.call(_arguments))
    return false
  }

  // Define our start handler
  private UNIMPLEMENTED_START(..._) {
    this.error('You need to include some adapter that implements __karma__.start method!')
  }

  // all files loaded, let's start the execution
  loaded = () => {
    // has error -> cancel
    if (!this.hasError) {
      this.start(this.config)
    }

    // remove reference to child iframe
    this.start = this.UNIMPLEMENTED_START
  }

  // supposed to be overriden by the context
  // TODO(vojta): support multiple callbacks (queue)
  start = this.UNIMPLEMENTED_START

  // Define bindings for context window
  setupContext = (contextWindow) => {
    // If we clear the context after every run and we already had an error
    //   then stop now. Otherwise, carry on.
    if (this.config.clearContext && this.hasError) {
      return
    }

    // Perform window level bindings
    // DEV: We return `self.error` since we want to `return false` to ignore errors
    contextWindow.onerror = (..._arguments) => this.error.apply(this, _arguments)
    // DEV: We must defined a function since we don't want to pass the event object
    contextWindow.onbeforeunload = (e, b) => {
      this.callParentKarmaMethod('onbeforeunload', [])
    }

    contextWindow.dump = (..._arguments) => this.log('dump', _arguments)

    contextWindow.alert = msg => this.log('alert', [msg])

    // If we want to overload our console, then do it
    var getConsole = currentWindow => currentWindow.console || {
      log: ()=>{},
      info: ()=>{},
      warn: ()=>{},
      error: ()=>{},
      debug: ()=>{}
    }
    if (this.config.captureConsole) {
      // patch the console
      var localConsole = contextWindow.console = getConsole(contextWindow)
      var logMethods = ['log', 'info', 'warn', 'error', 'debug']
      var patchConsoleMethod = (method) => {
        var orig = localConsole[method]
        if (!orig) {
          return
        }
        localConsole[method] = (..._arguments) => {
          this.log(method, _arguments)
          return Function.prototype.apply.call(orig, localConsole, _arguments)
        }
      }
      for (var i = 0; i < logMethods.length; i++) {
        patchConsoleMethod(logMethods[i])
      }
    }
  }

  info(param: {log: string; type: any}) {
  }

  /** Define call/proxy methods */
  static getDirectCallParentKarmaMethod(parentWindow) {
    return function directCallParentKarmaMethod(method, args) {
      // If the method doesn't exist, then error out
      if (!parentWindow.karma[method]) {
        parentWindow.karma.error('Expected Karma method "' + method + '" to exist but it doesn\'t')
        return
      }

      // Otherwise, run our method
      parentWindow.karma[method].apply(parentWindow.karma, args)
    }
  }

  static getPostMessageCallParentKarmaMethod(parentWindow) {
    return function postMessageCallParentKarmaMethod(method, args) {
      parentWindow.postMessage({__karmaMethod: method, __karmaArguments: args}, window.location.origin)
    }
  }

}
