import {VERSION, CONTEXT_URL} from './constants'
import {stringify} from '../common/stringify'
import * as util from '../common/util'
import {ClientOptions} from '../lib/config-options'

export class Karma {
  private startEmitted = false

  private reloadingContext = false
  private returnUrl

  private resultsBufferLimit = 50
  private resultsBuffer = []

  VERSION = VERSION
  config: ClientOptions = {}

  // Expose for testing purposes as there is no global socket.io
  // registry anymore.
  constructor(public socket, private iframe, private opener, navigator, private location) {
    var queryParams = util.parseQueryParams(location.search)
    var browserId = queryParams.id || util.generateId('manual-')
    var displayName = queryParams.displayName
    this.returnUrl = queryParams['return_url' + ''] || null

    // Set up postMessage bindings for current window
    // DEV: These are to allow windows in separate processes execute local tasks
    //   Electron is one of these environments
    if (window.addEventListener) {
      window.addEventListener('message', (evt: any) => {
        // Resolve the origin of our message
        var origin = evt.origin || evt.originalEvent.origin

        // If the message isn't from our host, then reject it
        if (origin !== window.location.origin) {
          return
        }

        // Take action based on the message type
        var method = evt.data.__karmaMethod
        if (method) {
          if (!this[method]) {
            this.error('Received `postMessage` for "' + method + '" but the method doesn\'t exist')
            return
          }
          this[method].apply(this, evt.data.__karmaArguments)
        }
      }, false)
    }

    socket.on('execute', cfg => {
      // reset startEmitted and reload the iframe
      this.startEmitted = false
      this.config = cfg
      // if not clearing context, reloadingContext always true to prevent beforeUnload error
      this.reloadingContext = !this.config.clearContext
      this.navigateContextTo(CONTEXT_URL)

      // clear the console before run
      // works only on FF (Safari, Chrome do not allow to clear console from js source)
      if (window.console && window.console.clear) {
        window.console.clear()
      }
    })
    socket.on('stop', () => {
      this.complete()
    })

    // report browser name, id
    socket.on('connect', () => {
      socket.io.engine.on('upgrade', () => {
        this.resultsBufferLimit = 1
      })
      var info: any = {
        name: navigator.userAgent,
        id: browserId
      }
      if (displayName) {
        info.displayName = displayName
      }
      socket.emit('register', info)
    })
  }

  private childWindow = null

  private navigateContextTo = (url) => {
    if (this.config.useIframe === false) {
      // If there is a window already open, then close it
      // DEV: In some environments (e.g. Electron), we don't have setter access for location
      if (this.childWindow !== null && this.childWindow.closed !== true) {
        this.childWindow.close()
      }
      this.childWindow = this.opener(url)
    } else {
      this.iframe.src = url
    }
  }

  onbeforeunload = () => {
    if (!this.reloadingContext) {
      // TODO(vojta): show what test (with explanation about jasmine.UPDATE_INTERVAL)
      this.error('Some of your tests did a full page reload!')
    }
  }

  log = (type, args) => {
    var values = []

    for (var i = 0; i < args.length; i++) {
      values.push(this.stringify(args[i], 3))
    }

    this.info({log: values.join(', '), type: type})
  }

  stringify = stringify

  private clearContext = () => {
    this.reloadingContext = true

    this.navigateContextTo('about:blank')
  }

  // error during js file loading (most likely syntax error)
  // we are not going to execute at all
  error = (msg, url?, line?) => {
    var message = msg

    if (url) {
      message = msg + '\nat ' + url + (line ? ':' + line : '')
    }

    this.socket.emit('karma_error', message)
    this.complete()
    return false
  }

  result = (result) => {
    if (!this.startEmitted) {
      this.socket.emit('start', {total: null})
      this.startEmitted = true
    }

    if (this.resultsBufferLimit === 1) {
      return this.socket.emit('result', result)
    }

    this.resultsBuffer.push(result)

    if (this.resultsBuffer.length === this.resultsBufferLimit) {
      this.socket.emit('result', this.resultsBuffer)
      this.resultsBuffer = []
    }
  }

  complete = (result?) => {
    if (this.resultsBuffer.length) {
      this.socket.emit('result', this.resultsBuffer)
      this.resultsBuffer = []
    }

    if (this.config.clearContext) {
      // give the browser some time to breath, there could be a page reload, but because a bunch of
      // tests could run in the same event loop, we wouldn't notice.
      setTimeout(() => {
        this.clearContext()
      }, 0)
    }

    this.socket.emit('complete', result || {}, () => {
      if (this.returnUrl) {
        this.location.href = this.returnUrl
      }
    })
  }

  info(info) {
    // TODO(vojta): introduce special API for this
    if (!this.startEmitted && util.isDefined(info.total)) {
      this.socket.emit('start', info)
      this.startEmitted = true
    } else {
      this.socket.emit('info', info)
    }
  }
}
