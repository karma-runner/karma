'use strict'

const SocketIO = require('socket.io')
const di = require('di')
const util = require('util')
const spawn = require('child_process').spawn
const tmp = require('tmp')
const fs = require('fs')
const path = require('path')

const NetUtils = require('./utils/net-utils')
const root = global || window || this

const cfg = require('./config')
const logger = require('./logger')
const constant = require('./constants')
const watcher = require('./watcher')
const plugin = require('./plugin')

const createServeFile = require('./web-server').createServeFile
const createServeStaticFile = require('./web-server').createServeStaticFile
const createFilesPromise = require('./web-server').createFilesPromise
const createWebServer = require('./web-server').createWebServer
const preprocessor = require('./preprocessor')
const Launcher = require('./launcher').Launcher
const FileList = require('./file-list')
const reporter = require('./reporter')
const helper = require('./helper')
const events = require('./events')
const KarmaEventEmitter = events.EventEmitter
const EventEmitter = require('events').EventEmitter
const Executor = require('./executor')
const Browser = require('./browser')
const BrowserCollection = require('./browser_collection')
const EmitterWrapper = require('./emitter_wrapper')
const processWrapper = new EmitterWrapper(process)

function createSocketIoServer (webServer, executor, config) {
  const server = new SocketIO.Server(webServer, {
    // avoid destroying http upgrades from socket.io to get proxied websockets working
    destroyUpgrade: false,
    path: config.urlRoot + 'socket.io/',
    transports: config.transports,
    forceJSONP: config.forceJSONP,
    // Default is 5000 in socket.io v2.x and v3.x.
    pingTimeout: config.pingTimeout || 5000,
    // Default in v2 is 1e8 and coverage results can fail at 1e6
    maxHttpBufferSize: 1e8
  })

  // hack to overcome circular dependency
  executor.socketIoSockets = server.sockets

  return server
}

class Server extends KarmaEventEmitter {
  constructor (cliOptionsOrConfig, done) {
    super()
    cliOptionsOrConfig = cliOptionsOrConfig || {}
    this.log = logger.create('karma-server')
    done = helper.isFunction(done) ? done : process.exit
    this.loadErrors = []

    let config
    if (cliOptionsOrConfig instanceof cfg.Config) {
      config = cliOptionsOrConfig
    } else {
      logger.setupFromConfig({
        colors: cliOptionsOrConfig.colors,
        logLevel: cliOptionsOrConfig.logLevel
      })
      const deprecatedCliOptionsMessage =
        'Passing raw CLI options to `new Server(config, done)` is ' +
        'deprecated. Use ' +
        '`parseConfig(configFilePath, cliOptions, {promiseConfig: true, throwErrors: true})` ' +
        'to prepare a processed `Config` instance and pass that as the ' +
        '`config` argument instead.'
      this.log.warn(deprecatedCliOptionsMessage)
      try {
        config = cfg.parseConfig(
          cliOptionsOrConfig.configFile,
          cliOptionsOrConfig,
          {
            promiseConfig: false,
            throwErrors: true
          }
        )
      } catch (parseConfigError) {
        // TODO: change how `done` falls back to exit in next major version
        //  SEE: https://github.com/karma-runner/karma/pull/3635#discussion_r565399378
        done(1)
        return
      }
    }

    this.log.debug('Final config', util.inspect(config, false, /** depth **/ null))

    if (!config.autoWatch && !config.singleRun) {
      this.log.warn('`autowatch` and `singleRun` are both `false`. In order to execute tests use `karma run`.')
    }

    let modules = [{
      helper: ['value', helper],
      logger: ['value', logger],
      done: ['value', done || process.exit],
      emitter: ['value', this],
      server: ['value', this],
      watcher: ['value', watcher],
      launcher: ['factory', Launcher.factory],
      config: ['value', config],
      instantiatePlugin: ['factory', plugin.createInstantiatePlugin],
      preprocess: ['factory', preprocessor.createPriorityPreprocessor],
      fileList: ['factory', FileList.factory],
      webServer: ['factory', createWebServer],
      serveFile: ['factory', createServeFile],
      serveStaticFile: ['factory', createServeStaticFile],
      filesPromise: ['factory', createFilesPromise],
      socketServer: ['factory', createSocketIoServer],
      executor: ['factory', Executor.factory],
      // TODO: Deprecated. Remove in the next major
      customFileHandlers: ['value', []],
      reporter: ['factory', reporter.createReporters],
      capturedBrowsers: ['factory', BrowserCollection.factory],
      args: ['value', {}],
      timer: ['value', {
        setTimeout () {
          return setTimeout.apply(root, arguments)
        },
        clearTimeout
      }]
    }]

    this.on('load_error', (type, name) => {
      this.log.debug(`Registered a load error of type ${type} with name ${name}`)
      this.loadErrors.push([type, name])
    })

    modules = modules.concat(plugin.resolve(config.plugins, this))
    this._injector = new di.Injector(modules)
  }

  async start () {
    const config = this.get('config')
    try {
      this._boundServer = await NetUtils.bindAvailablePort(config.port, config.listenAddress)
      this._boundServer.on('connection', (socket) => {
        // Attach an error handler to avoid UncaughtException errors.
        socket.on('error', (err) => {
          // Errors on this socket are retried, ignore them
          this.log.debug('Ignoring error on webserver connection: ' + err)
        })
      })
      config.port = this._boundServer.address().port
      await this._injector.invoke(this._start, this)
    } catch (err) {
      this.log.error(`Server start failed on port ${config.port}: ${err}`)
      this._close(1)
    }
  }

  get (token) {
    return this._injector.get(token)
  }

  refreshFiles () {
    return this._fileList ? this._fileList.refresh() : Promise.resolve()
  }

  refreshFile (path) {
    return this._fileList ? this._fileList.changeFile(path) : Promise.resolve()
  }

  emitExitAsync (code) {
    const name = 'exit'
    let pending = this.listeners(name).length
    const deferred = helper.defer()

    function resolve () {
      deferred.resolve(code)
    }

    try {
      this.emit(name, (newCode) => {
        if (newCode && typeof newCode === 'number') {
          // Only update code if it is given and not zero
          code = newCode
        }
        if (!--pending) {
          resolve()
        }
      })

      if (!pending) {
        resolve()
      }
    } catch (err) {
      deferred.reject(err)
    }
    return deferred.promise
  }

  async _start (config, launcher, preprocess, fileList, capturedBrowsers, executor, done) {
    if (config.detached) {
      this._detach(config, done)
      return
    }

    this._fileList = fileList

    await Promise.all(
      config.frameworks.map((framework) => this._injector.get('framework:' + framework))
    )

    const webServer = this._injector.get('webServer')
    const socketServer = this._injector.get('socketServer')

    const singleRunDoneBrowsers = Object.create(null)
    const singleRunBrowsers = new BrowserCollection(new EventEmitter())
    let singleRunBrowserNotCaptured = false

    webServer.on('error', (err) => {
      this.log.error(`Webserver fail ${err}`)
      this._close(1)
    })

    const afterPreprocess = () => {
      if (config.autoWatch) {
        const watcher = this.get('watcher')
        this._injector.invoke(watcher)
      }

      webServer.listen(this._boundServer, () => {
        this.log.info(`Karma v${constant.VERSION} server started at ${config.protocol}//${config.hostname}:${config.port}${config.urlRoot}`)

        this.emit('listening', config.port)
        if (config.browsers && config.browsers.length) {
          this._injector.invoke(launcher.launch, launcher).forEach((browserLauncher) => {
            singleRunDoneBrowsers[browserLauncher.id] = false
          })
        }
        if (this.loadErrors.length > 0) {
          this.log.error(new Error(`Found ${this.loadErrors.length} load error${this.loadErrors.length === 1 ? '' : 's'}`))
          this._close(1)
        }
      })
    }

    fileList.refresh().then(afterPreprocess, (err) => {
      this.log.error('Error during file loading or preprocessing\n' + err.stack || err)
      afterPreprocess()
    })

    this.on('browsers_change', () => socketServer.sockets.emit('info', capturedBrowsers.serialize()))

    this.on('browser_register', (browser) => {
      launcher.markCaptured(browser.id)

      if (launcher.areAllCaptured()) {
        this.emit('browsers_ready')

        if (config.autoWatch) {
          executor.schedule()
        }
      }
    })

    if (config.browserConsoleLogOptions && config.browserConsoleLogOptions.path) {
      const configLevel = config.browserConsoleLogOptions.level || 'debug'
      const configFormat = config.browserConsoleLogOptions.format || '%b %T: %m'
      const configPath = config.browserConsoleLogOptions.path
      const configPathDir = path.dirname(configPath)
      if (!fs.existsSync(configPathDir)) fs.mkdirSync(configPathDir, { recursive: true })
      this.log.info(`Writing browser console to file: ${configPath}`)
      const browserLogFile = fs.openSync(configPath, 'w+')
      const levels = ['log', 'error', 'warn', 'info', 'debug']
      this.on('browser_log', function (browser, message, level) {
        if (levels.indexOf(level.toLowerCase()) > levels.indexOf(configLevel)) {
          return
        }
        if (!helper.isString(message)) {
          message = util.inspect(message, { showHidden: false, colors: false })
        }
        const logMap = { '%m': message, '%t': level.toLowerCase(), '%T': level.toUpperCase(), '%b': browser }
        const logString = configFormat.replace(/%[mtTb]/g, (m) => logMap[m])
        this.log.debug(`Writing browser console line: ${logString}`)
        fs.writeSync(browserLogFile, logString + '\n')
      })
    }

    socketServer.sockets.on('connection', (socket) => {
      this.log.debug(`A browser has connected on socket ${socket.id}`)

      const replySocketEvents = events.bufferEvents(socket, ['start', 'info', 'karma_error', 'result', 'complete'])

      socket.on('error', (err) => {
        this.log.debug('karma server socket error: ' + err)
      })

      socket.on('register', (info) => {
        const knownBrowser = info.id ? (capturedBrowsers.getById(info.id) || singleRunBrowsers.getById(info.id)) : null

        if (knownBrowser) {
          knownBrowser.reconnect(socket, info.isSocketReconnect)
        } else {
          const newBrowser = this._injector.createChild([{
            id: ['value', info.id || null],
            fullName: ['value', (helper.isDefined(info.displayName) ? info.displayName : info.name)],
            socket: ['value', socket]
          }]).invoke(Browser.factory)

          newBrowser.init()

          if (config.singleRun) {
            newBrowser.execute()
            singleRunBrowsers.add(newBrowser)
          }
        }

        replySocketEvents()
      })
    })

    const emitRunCompleteIfAllBrowsersDone = () => {
      if (Object.keys(singleRunDoneBrowsers).every((key) => singleRunDoneBrowsers[key])) {
        this.emit('run_complete', singleRunBrowsers, singleRunBrowsers.getResults(singleRunBrowserNotCaptured, config))
      }
    }

    this.on('browser_complete', (completedBrowser) => {
      if (completedBrowser.lastResult.disconnected && completedBrowser.disconnectsCount <= config.browserDisconnectTolerance) {
        this.log.info(`Restarting ${completedBrowser.name} (${completedBrowser.disconnectsCount} of ${config.browserDisconnectTolerance} attempts)`)

        if (!launcher.restart(completedBrowser.id)) {
          this.emit('browser_restart_failure', completedBrowser)
        }
      } else {
        this.emit('browser_complete_with_no_more_retries', completedBrowser)
      }
    })

    this.on('stop', (done) => {
      this.log.debug('Received stop event, exiting.')
      this._close()
      done()
    })

    if (config.singleRun) {
      this.on('browser_restart_failure', (completedBrowser) => {
        singleRunDoneBrowsers[completedBrowser.id] = true
        emitRunCompleteIfAllBrowsersDone()
      })

      // This is the normal exit trigger.
      this.on('browser_complete_with_no_more_retries', function (completedBrowser) {
        singleRunDoneBrowsers[completedBrowser.id] = true

        if (launcher.kill(completedBrowser.id)) {
          completedBrowser.remove()
        }

        emitRunCompleteIfAllBrowsersDone()
      })

      this.on('browser_process_failure', (browserLauncher) => {
        singleRunDoneBrowsers[browserLauncher.id] = true
        singleRunBrowserNotCaptured = true

        emitRunCompleteIfAllBrowsersDone()
      })

      this.on('run_complete', (browsers, results) => {
        this.log.debug('Run complete, exiting.')
        this._close(results.exitCode)
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

    processWrapper.on('SIGINT', () => this._close())
    processWrapper.on('SIGTERM', () => this._close())

    const reportError = (error) => {
      this.log.error(error)
      process.emit('infrastructure_error', error)
      this._close(1)
    }

    processWrapper.on('unhandledRejection', (error) => {
      this.log.error(`UnhandledRejection: ${error.stack || error.message || String(error)}`)
      reportError(error)
    })

    processWrapper.on('uncaughtException', (error) => {
      this.log.error(`UncaughtException: ${error.stack || error.message || String(error)}`)
      reportError(error)
    })
  }

  _detach (config, done) {
    const tmpFile = tmp.fileSync({ keep: true })
    this.log.info('Starting karma detached')
    this.log.info('Run "karma stop" to stop the server.')
    this.log.debug(`Writing config to tmp-file ${tmpFile.name}`)
    config.detached = false
    try {
      fs.writeFileSync(tmpFile.name, JSON.stringify(config), 'utf8')
    } catch (e) {
      this.log.error("Couldn't write temporary configuration file")
      done(1)
      return
    }
    const child = spawn(process.argv[0], [path.resolve(__dirname, '../lib/detached.js'), tmpFile.name], {
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
  }

  /**
   * Cleanup all resources allocated by Karma and call the `done` callback
   * with the result of the tests execution.
   *
   * @param [exitCode] - Optional exit code. If omitted will be computed by
   * 'exit' event listeners.
   */
  _close (exitCode) {
    const webServer = this._injector.get('webServer')
    const socketServer = this._injector.get('socketServer')
    const done = this._injector.get('done')

    const webServerCloseTimeout = 3000
    const sockets = socketServer.sockets.sockets

    Object.keys(sockets).forEach((id) => {
      const socket = sockets[id]
      socket.removeAllListeners('disconnect')
      if (!socket.disconnected) {
        process.nextTick(socket.disconnect.bind(socket))
      }
    })

    this.emitExitAsync(exitCode).catch((err) => {
      this.log.error('Error while calling exit event listeners\n' + err.stack || err)
      return 1
    }).then((code) => {
      socketServer.sockets.removeAllListeners()
      socketServer.close()

      let removeAllListenersDone = false
      const removeAllListeners = () => {
        if (removeAllListenersDone) {
          return
        }
        removeAllListenersDone = true
        webServer.removeAllListeners()
        processWrapper.removeAllListeners()
        done(code || 0)
      }

      const closeTimeout = setTimeout(removeAllListeners, webServerCloseTimeout)

      webServer.close(() => {
        clearTimeout(closeTimeout)
        removeAllListeners()
      })
    })
  }

  stop () {
    return this.emitAsync('stop')
  }
}

Server.prototype._start.$inject = ['config', 'launcher', 'preprocess', 'fileList', 'capturedBrowsers', 'executor', 'done']

module.exports = Server
