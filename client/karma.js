var stringify = require('../common/stringify')
var constant = require('./constants')
var util = require('../common/util')

function Karma (updater, socket, iframe, opener, navigator, location, document) {
  this.updater = updater
  var startEmitted = false
  var self = this
  var queryParams = util.parseQueryParams(location.search)
  var browserId = queryParams.id || util.generateId('manual-')
  var displayName = queryParams.displayName
  var returnUrl = queryParams['return_url' + ''] || null

  var resultsBufferLimit = 50
  var resultsBuffer = []

  // This is a no-op if not running with a Trusted Types CSP policy, and
  // lets tests declare that they trust the way that karma creates and handles
  // URLs.
  //
  // More info about the proposed Trusted Types standard at
  // https://github.com/WICG/trusted-types
  var policy = {
    createURL: function (s) {
      return s
    },
    createScriptURL: function (s) {
      return s
    }
  }
  var trustedTypes = window.trustedTypes || window.TrustedTypes
  if (trustedTypes) {
    policy = trustedTypes.createPolicy('karma', policy)
    if (!policy.createURL) {
      // Install createURL for newer browsers. Only browsers that implement an
      //     old version of the spec require createURL.
      //     Should be safe to delete all reference to createURL by
      //     February 2020.
      // https://github.com/WICG/trusted-types/pull/204
      policy.createURL = function (s) { return s }
    }
  }

  // To start we will signal the server that we are not reconnecting. If the socket loses
  // connection and was able to reconnect to the Karma server we will get a
  // second 'connect' event. There we will pass 'true' and that will be passed to the
  // Karma server then, so that Karma can differentiate between a socket client
  // econnect and a full browser reconnect.
  var socketReconnect = false

  this.VERSION = constant.VERSION
  this.config = {}

  // Expose for testing purposes as there is no global socket.io
  // registry anymore.
  this.socket = socket

  // Set up postMessage bindings for current window
  // DEV: These are to allow windows in separate processes execute local tasks
  //   Electron is one of these environments
  if (window.addEventListener) {
    window.addEventListener('message', function handleMessage (evt) {
      // Resolve the origin of our message
      var origin = evt.origin || evt.originalEvent.origin

      // If the message isn't from our host, then reject it
      if (origin !== window.location.origin) {
        return
      }

      // Take action based on the message type
      var method = evt.data.__karmaMethod
      if (method) {
        if (!self[method]) {
          self.error('Received `postMessage` for "' + method + '" but the method doesn\'t exist')
          return
        }
        self[method].apply(self, evt.data.__karmaArguments)
      }
    }, false)
  }

  var childWindow = null
  function navigateContextTo (url) {
    if (self.config.useIframe === false) {
      // run in new window
      if (self.config.runInParent === false) {
        // If there is a window already open, then close it
        // DEV: In some environments (e.g. Electron), we don't have setter access for location
        if (childWindow !== null && childWindow.closed !== true) {
          // The onbeforeunload listener was added by context to catch
          // unexpected navigations while running tests.
          childWindow.onbeforeunload = undefined
          childWindow.close()
        }
        childWindow = opener(url)
      // run context on parent element (client_with_context)
      // using window.__karma__.scriptUrls to get the html element strings and load them dynamically
      } else if (url !== 'about:blank') {
        var loadScript = function (idx) {
          if (idx < window.__karma__.scriptUrls.length) {
            var parser = new DOMParser()
            // Revert escaped characters with special roles in HTML before parsing
            var string = window.__karma__.scriptUrls[idx]
              .replace(/\\x3C/g, '<')
              .replace(/\\x3E/g, '>')
            var doc = parser.parseFromString(string, 'text/html')
            var ele = doc.head.firstChild || doc.body.firstChild
            // script elements created by DomParser are marked as unexecutable,
            // create a new script element manually and copy necessary properties
            // so it is executable
            if (ele.tagName && ele.tagName.toLowerCase() === 'script') {
              var tmp = ele
              ele = document.createElement('script')
              ele.src = policy.createScriptURL(tmp.src)
              ele.crossOrigin = tmp.crossOrigin
            }
            ele.onload = function () {
              loadScript(idx + 1)
            }
            document.body.appendChild(ele)
          } else {
            window.__karma__.loaded()
          }
        }
        loadScript(0)
      }
    // run in iframe
    } else {
      // The onbeforeunload listener was added by the context to catch
      // unexpected navigations while running tests.
      iframe.contentWindow.onbeforeunload = undefined
      iframe.src = policy.createURL(url)
    }
  }

  this.log = function (type, args) {
    var values = []

    for (var i = 0; i < args.length; i++) {
      values.push(this.stringify(args[i], 3))
    }

    this.info({ log: values.join(', '), type: type })
  }

  this.stringify = stringify

  function getLocation (url, lineno, colno) {
    var location = ''

    if (url !== undefined) {
      location += url
    }

    if (lineno !== undefined) {
      location += ':' + lineno
    }

    if (colno !== undefined) {
      location += ':' + colno
    }

    return location
  }

  // error during js file loading (most likely syntax error)
  // we are not going to execute at all. `window.onerror` callback.
  this.error = function (messageOrEvent, source, lineno, colno, error) {
    var message
    if (typeof messageOrEvent === 'string') {
      message = messageOrEvent

      var location = getLocation(source, lineno, colno)
      if (location !== '') {
        message += '\nat ' + location
      }
      if (error && error.stack) {
        message += '\n\n' + error.stack
      }
    } else {
      // create an object with the string representation of the message to
      // ensure all its content is properly transferred to the console log
      message = { message: messageOrEvent, str: messageOrEvent.toString() }
    }

    socket.emit('karma_error', message)
    self.updater.updateTestStatus('karma_error ' + message)
    this.complete()
    return false
  }

  this.result = function (originalResult) {
    var convertedResult = {}

    // Convert all array-like objects to real arrays.
    for (var propertyName in originalResult) {
      if (Object.prototype.hasOwnProperty.call(originalResult, propertyName)) {
        var propertyValue = originalResult[propertyName]

        if (Object.prototype.toString.call(propertyValue) === '[object Array]') {
          convertedResult[propertyName] = Array.prototype.slice.call(propertyValue)
        } else {
          convertedResult[propertyName] = propertyValue
        }
      }
    }

    if (!startEmitted) {
      socket.emit('start', { total: null })
      self.updater.updateTestStatus('start')
      startEmitted = true
    }

    if (resultsBufferLimit === 1) {
      self.updater.updateTestStatus('result')
      return socket.emit('result', convertedResult)
    }

    resultsBuffer.push(convertedResult)

    if (resultsBuffer.length === resultsBufferLimit) {
      socket.emit('result', resultsBuffer)
      self.updater.updateTestStatus('result')
      resultsBuffer = []
    }
  }

  this.complete = function (result) {
    if (resultsBuffer.length) {
      socket.emit('result', resultsBuffer)
      resultsBuffer = []
    }

    socket.emit('complete', result || {})
    if (this.config.clearContext) {
      navigateContextTo('about:blank')
    } else {
      self.updater.updateTestStatus('complete')
    }
    if (returnUrl) {
      if (!/^https?:\/\//.test(returnUrl)) {
        throw new Error(`Security: Navigation to ${returnUrl} was blocked to prevent malicious exploits.`)
      }
      location.href = returnUrl
    }
  }

  this.info = function (info) {
    // TODO(vojta): introduce special API for this
    if (!startEmitted && util.isDefined(info.total)) {
      socket.emit('start', info)
      startEmitted = true
    } else {
      socket.emit('info', info)
    }
  }

  socket.on('execute', function (cfg) {
    self.updater.updateTestStatus('execute')
    // reset startEmitted and reload the iframe
    startEmitted = false
    self.config = cfg

    navigateContextTo(constant.CONTEXT_URL)

    if (self.config.clientDisplayNone) {
      [].forEach.call(document.querySelectorAll('#banner, #browsers'), function (el) {
        el.style.display = 'none'
      })
    }

    // clear the console before run
    // works only on FF (Safari, Chrome do not allow to clear console from js source)
    if (window.console && window.console.clear) {
      window.console.clear()
    }
  })
  socket.on('stop', function () {
    this.complete()
  }.bind(this))

  // Report the browser name and Id. Note that this event can also fire if the connection has
  // been temporarily lost, but the socket reconnected automatically. Read more in the docs:
  // https://socket.io/docs/client-api/#Event-%E2%80%98connect%E2%80%99
  socket.on('connect', function () {
    socket.io.engine.on('upgrade', function () {
      resultsBufferLimit = 1
      // Flush any results which were buffered before the upgrade to WebSocket protocol.
      if (resultsBuffer.length > 0) {
        socket.emit('result', resultsBuffer)
        resultsBuffer = []
      }
    })
    var info = {
      name: navigator.userAgent,
      id: browserId,
      isSocketReconnect: socketReconnect
    }
    if (displayName) {
      info.displayName = displayName
    }
    socket.emit('register', info)
    socketReconnect = true
  })
}

module.exports = Karma
