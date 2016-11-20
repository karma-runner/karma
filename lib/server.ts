import {ConfigOptions} from './config-options'
var SocketIO = require('socket.io')
var di = require('di')
import util = require('util')
import Promise = require('bluebird')
import {spawn} from 'child_process'
import tmp = require('tmp')
import fs = require('fs')
import path = require('path')
var root = global || window || this

import cfg = require('./config')
import logger = require('./logger')
import constant = require('./constants')
import watcher = require('./watcher')
import plugin = require('./plugin')

import ws = require('./web-server')
import preprocessor = require('./preprocessor')
import {Launcher} from './launcher'
import FileList = require('./file-list')
import reporter = require('./reporter')
import helper = require('./helper')
import {KarmaEventEmitter, bufferEvents} from './events'
import {Executor} from './executor'
import {Browser} from './browser'
import {BrowserCollection as BrowserCollection} from './browser_collection'
import {EmitterWrapper} from './emitter_wrapper'
var processWrapper = new EmitterWrapper(process)

function createSocketIoServer (webServer, executor, config) {
  var server = new SocketIO(webServer, {
    // avoid destroying http upgrades from socket.io to get proxied websockets working
    destroyUpgrade: false,
    path: config.urlRoot + 'socket.io/',
    transports: config.transports,
    forceJSONP: config.forceJSONP
  })

  // hack to overcome circular dependency
  executor.socketIoSockets = server.sockets

  return server
}

// Constructor
export class Server extends KarmaEventEmitter {

  log = logger.create()

  loadErrors = []
  private _injector
  private _fileList

  constructor(cliOptions: ConfigOptions, done?) {
    super()

    logger.setupFromConfig(cliOptions)

    var config = cfg.parseConfig(cliOptions.configFile, cliOptions)

    var modules = [{
      helper: ['value', helper],
      logger: ['value', logger],
      done: ['value', done || process.exit],
      emitter: ['value', this],
      server: ['value', this],
      launcher: ['type', Launcher],
      config: ['value', config],
      preprocess: ['factory', preprocessor.createPreprocessor],
      fileList: ['type', FileList],
      webServer: ['factory', ws.create],
      socketServer: ['factory', createSocketIoServer],
      executor: ['type', Executor],
      // TODO(vojta): remove
      customFileHandlers: ['value', []],
      // TODO(vojta): remove, once karma-dart does not rely on it
      customScriptTypes: ['value', []],
      reporter: ['factory', reporter.createReporters],
      capturedBrowsers: ['type', BrowserCollection],
      args: ['value', {}],
      timer: ['value', {
        setTimeout: function () {
          return setTimeout.apply(root, arguments)
        },
        clearTimeout: function (timeoutId) {
          clearTimeout(timeoutId)
        }
      }]
    }]

    this._setUpLoadErrorListener()
    // Load the plugins
    modules = modules.concat(plugin.resolve(config.plugins, this))

    this._injector = new di.Injector(modules)
  }

// Public Methods
// --------------

  // Start the server
  start(data?) {
    this._injector.invoke(this._start, this)
  }

  /**
   * Backward-compatibility with karma-intellij bundled with WebStorm.
   * Deprecated since version 0.13, to be removed in 0.14
   */
  static start(cliOptions, done) {
    var server = new Server(cliOptions, done)
    server.start()
  }

  // Get properties from the injector
  //
  // token - String
  get(token) {
    return this._injector.get(token)
  }

  // Force a refresh of the file list
  refreshFiles() {
    if (!this._fileList) return Promise.resolve()

    return this._fileList.refresh()
  }

  // Private Methods
  // ---------------

  private _start(config, launcher, preprocess, fileList, capturedBrowsers, executor, done) {
    if (config.detached) {
      this._detach(config, done)
      return
    }

    this._fileList = fileList

    config.frameworks.forEach(framework => this._injector.get('framework:' + framework))

    var webServer = this._injector.get('webServer')
    var socketServer = this._injector.get('socketServer')

    // A map of launched browsers.
    var singleRunDoneBrowsers = Object.create(null)

    // Passing fake event emitter, so that it does not emit on the global,
    // we don't care about these changes.
    var singleRunBrowsers = new BrowserCollection(new KarmaEventEmitter())

    // Some browsers did not get captured.
    var singleRunBrowserNotCaptured = false

    webServer.on('error', e => {
      if (e.code === 'EADDRINUSE') {
        this.log.warn('Port %d in use', config.port)
        config.port++
        webServer.listen(config.port)
      } else {
        throw e
      }
    })

    var afterPreprocess = () => {
      if (config.autoWatch) {
        this._injector.invoke(watcher.watch)
      }

      webServer.listen(config.port, () => {
        this.log.info('Karma v%s server started at %s//%s:%s%s', constant.VERSION,
          config.protocol, config.hostname, config.port, config.urlRoot)

        this.emit('listening', config.port)
        if (config.browsers && config.browsers.length) {
          this._injector.invoke(launcher.launch, launcher).forEach(browserLauncher =>
            singleRunDoneBrowsers[browserLauncher.id] = false
          )
        }
        var noLoadErrors = this.loadErrors.length
        if (noLoadErrors > 0) {
          this.log.error('Found %d load error%s', noLoadErrors, noLoadErrors === 1 ? '' : 's')
          process.kill(process.pid, 'SIGINT')
        }
      })
    }

    fileList.refresh().then(afterPreprocess, afterPreprocess)

    this.on('browsers_change', () => {
      // TODO(vojta): send only to interested browsers
      socketServer.sockets.emit('info', capturedBrowsers.serialize())
    })

    this.on('browser_register', browser => {
      launcher.markCaptured(browser.id)

      // TODO(vojta): This is lame, browser can get captured and then
      // crash (before other browsers get captured).
      if (launcher.areAllCaptured()) {
        this.emit('browsers_ready')

        if (config.autoWatch) {
          executor.schedule()
        }
      }
    })

    if (config.browserConsoleLogOptions && config.browserConsoleLogOptions.path) {
      var configLevel = config.browserConsoleLogOptions.level || 'debug'
      var configFormat = config.browserConsoleLogOptions.format || '%b %T: %m'
      var configPath = config.browserConsoleLogOptions.path
      this.log.info('Writing browser console to file: %s', configPath)
      var browserLogFile = fs.openSync(configPath, 'w+')
      var levels = ['log', 'error', 'warn', 'info', 'debug']
      this.on('browser_log', (browser, message, level) => {
        if (levels.indexOf(level.toLowerCase()) > levels.indexOf(configLevel)) return
        if (!helper.isString(message)) {
          message = util.inspect(message, {showHidden: false, colors: false})
        }
        var logMap = {'%m': message, '%t': level.toLowerCase(), '%T': level.toUpperCase(), '%b': browser}
        var logString = configFormat.replace(/%[mtTb]/g, function (m) {
          return logMap[m]
        })
        this.log.debug('Writing browser console line: %s', logString)
        fs.write(browserLogFile, logString + '\n')
      })
    }

    var EVENTS_TO_REPLY = ['start', 'info', 'karma_error', 'result', 'complete']
    socketServer.sockets.on('connection', socket => {
      this.log.debug('A browser has connected on socket ' + socket.id)

      var replySocketEvents = bufferEvents(socket, EVENTS_TO_REPLY)

      socket.on('complete', (data, ack) => ack())

      socket.on('register', info => {
        var newBrowser
        var isRestart

        if (info.id) {
          newBrowser = capturedBrowsers.getById(info.id) || singleRunBrowsers.getById(info.id)
        }

        if (newBrowser) {
          isRestart = newBrowser.state === Browser.STATE_DISCONNECTED
          newBrowser.reconnect(socket)

          // We are restarting a previously disconnected browser.
          if (isRestart && config.singleRun) {
            newBrowser.execute(config.client)
          }
        } else {
          newBrowser = this._injector.createChild([{
            id: ['value', info.id || null],
            fullName: ['value', (helper.isDefined(info.displayName) ? info.displayName : info.name)],
            socket: ['value', socket]
          }]).instantiate(Browser)

          newBrowser.init()

          // execute in this browser immediately
          if (config.singleRun) {
            newBrowser.execute(config.client)
            singleRunBrowsers.add(newBrowser)
          }
        }

        replySocketEvents()
      })
    })

    var emitRunCompleteIfAllBrowsersDone = () => {
      // all browsers done
      var isDone = Object.keys(singleRunDoneBrowsers).reduce(function (isDone, id) {
        return isDone && singleRunDoneBrowsers[id]
      }, true)

      if (isDone) {
        var results = singleRunBrowsers.getResults()
        if (singleRunBrowserNotCaptured) {
          results.exitCode = 1
        } else if (results.success + results.failed === 0 && !config.failOnEmptyTestSuite) {
          results.exitCode = 0
          this.log.warn('Test suite was empty.')
        }
        this.emit('run_complete', singleRunBrowsers, results)
      }
    }

    this.on('browser_complete', completedBrowser => {
      if (completedBrowser.lastResult.disconnected &&
        completedBrowser.disconnectsCount <= config.browserDisconnectTolerance) {
        this.log.info('Restarting %s (%d of %d attempts)', completedBrowser.name,
          completedBrowser.disconnectsCount, config.browserDisconnectTolerance)

        if (!launcher.restart(completedBrowser.id)) {
          this.emit('browser_restart_failure', completedBrowser)
        }
      } else {
        this.emit('browser_complete_with_no_more_retries', completedBrowser)
      }
    })

    if (config.singleRun) {
      this.on('browser_restart_failure', completedBrowser => {
        singleRunDoneBrowsers[completedBrowser.id] = true
        emitRunCompleteIfAllBrowsersDone()
      })
      this.on('browser_complete_with_no_more_retries', completedBrowser => {
        singleRunDoneBrowsers[completedBrowser.id] = true

        if (launcher.kill(completedBrowser.id)) {
          // workaround to supress "disconnect" warning
          completedBrowser.state = Browser.STATE_DISCONNECTED
        }

        emitRunCompleteIfAllBrowsersDone()
      })

      this.on('browser_process_failure', browserLauncher => {
        singleRunDoneBrowsers[browserLauncher.id] = true
        singleRunBrowserNotCaptured = true

        emitRunCompleteIfAllBrowsersDone()
      })

      this.on('run_complete', (browsers, results) => {
        this.log.debug('Run complete, exiting.')
        disconnectBrowsers(results.exitCode)
      })

      this.emit('run_start', singleRunBrowsers)
    }

    if (config.autoWatch) {
      this.on('file_list_modified', () => {
        this.log.debug('List of files has changed, trying to execute')
        if (config.restartOnFileChange) {
          socketServer.sockets.emit('stop')
        }
        executor.schedule()
      })
    }

    var webServerCloseTimeout = 3000
    var disconnectBrowsers = code => {
      // Slightly hacky way of removing disconnect listeners
      // to suppress "browser disconnect" warnings
      // TODO(vojta): change the client to not send the event (if disconnected by purpose)
      var sockets = socketServer.sockets.sockets

      Object.keys(sockets).forEach(id => {
        var socket = sockets[id]
        socket.removeAllListeners('disconnect')
        if (!socket.disconnected) {
          // Disconnect asynchronously. Socket.io mutates the `sockets.sockets` array
          // underneath us so this would skip every other browser/socket.
          process.nextTick(socket.disconnect.bind(socket))
        }
      })

      var removeAllListenersDone = false
      var removeAllListeners = () => {
        // make sure we don't execute cleanup twice
        if (removeAllListenersDone) {
          return
        }
        removeAllListenersDone = true
        webServer.removeAllListeners()
        processWrapper.removeAllListeners()
        done(code || 0)
      }

      this.emitAsync('exit').then(() => {
        // don't wait forever on webServer.close() because
        // pending client connections prevent it from closing.
        var closeTimeout = setTimeout(removeAllListeners, webServerCloseTimeout)

        // shutdown the server...
        webServer.close(() => {
          clearTimeout(closeTimeout)
          removeAllListeners()
        })
      })
    }

    processWrapper.on('SIGINT', disconnectBrowsers)
    processWrapper.on('SIGTERM', disconnectBrowsers)

    // Handle all unhandled exceptions, so we don't just exit but
    // disconnect the browsers before exiting.
    processWrapper.on('uncaughtException', error => {
      this.log.error(error)
      disconnectBrowsers(1)
    })
  }

  private _setUpLoadErrorListener() {
    var self = this
    self.on('load_error', function (type, name) {
      self.log.debug('Registered a load error of type %s with name %s', type, name)
      self.loadErrors.push([type, name])
    })
  }

  private _detach(config, done) {
    var log = this.log
    var tmpFile = tmp.fileSync({keep: true})
    log.info('Starting karma detached')
    log.info('Run "karma stop" to stop the server.')
    log.debug('Writing config to tmp-file %s', tmpFile.name)
    config.detached = false
    try {
      fs.writeFileSync(tmpFile.name, JSON.stringify(config), 'utf8')
    } catch (e) {
      log.error("Couldn't write temporary configuration file")
      done(1)
      return
    }
    var child = spawn(process.argv[0], [path.resolve(__dirname, '../lib/detached.js'), tmpFile.name], {
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
  }
}
