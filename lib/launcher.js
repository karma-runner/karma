'use strict'

const Jobs = require('qjobs')

const log = require('./logger').create('launcher')

const baseDecorator = require('./launchers/base').decoratorFactory
const captureTimeoutDecorator = require('./launchers/capture_timeout').decoratorFactory
const retryDecorator = require('./launchers/retry').decoratorFactory
const processDecorator = require('./launchers/process').decoratorFactory

// TODO(vojta): remove once nobody uses it
const baseBrowserDecoratorFactory = function (
  baseLauncherDecorator,
  captureTimeoutLauncherDecorator,
  retryLauncherDecorator,
  processLauncherDecorator,
  processKillTimeout
) {
  return function (launcher) {
    baseLauncherDecorator(launcher)
    captureTimeoutLauncherDecorator(launcher)
    retryLauncherDecorator(launcher)
    processLauncherDecorator(launcher, processKillTimeout)
  }
}

class Launcher {
  constructor (server, emitter, injector) {
    this._server = server
    this._emitter = emitter
    this._injector = injector
    this._browsers = []
    this._lastStartTime = null

    // Attach list of dependency injection parameters to methods.
    this.launch.$inject = [
      'config.browsers',
      'config.concurrency'
    ]

    this.launchSingle.$inject = [
      'config.protocol',
      'config.hostname',
      'config.port',
      'config.urlRoot',
      'config.upstreamProxy',
      'config.processKillTimeout'
    ]

    this._emitter.on('exit', (callback) => this.killAll(callback))
  }

  getBrowserById (id) {
    return this._browsers.find((browser) => browser.id === id)
  }

  launchSingle (protocol, hostname, port, urlRoot, upstreamProxy, processKillTimeout) {
    if (upstreamProxy) {
      protocol = upstreamProxy.protocol
      hostname = upstreamProxy.hostname
      port = upstreamProxy.port
      urlRoot = upstreamProxy.path + urlRoot.substr(1)
    }

    return (name) => {
      let browser
      const locals = {
        id: ['value', Launcher.generateId()],
        name: ['value', name],
        processKillTimeout: ['value', processKillTimeout],
        baseLauncherDecorator: ['factory', baseDecorator],
        captureTimeoutLauncherDecorator: ['factory', captureTimeoutDecorator],
        retryLauncherDecorator: ['factory', retryDecorator],
        processLauncherDecorator: ['factory', processDecorator],
        baseBrowserDecorator: ['factory', baseBrowserDecoratorFactory]
      }

      // TODO(vojta): determine script from name
      if (name.includes('/')) {
        name = 'Script'
      }

      try {
        browser = this._injector.createChild([locals], ['launcher:' + name]).get('launcher:' + name)
      } catch (e) {
        if (e.message.includes(`No provider for "launcher:${name}"`)) {
          log.error(`Cannot load browser "${name}": it is not registered! Perhaps you are missing some plugin?`)
        } else {
          log.error(`Cannot load browser "${name}"!\n  ` + e.stack)
        }

        this._emitter.emit('load_error', 'launcher', name)
        return
      }

      this.jobs.add((args, done) => {
        log.info(`Starting browser ${browser.displayName || browser.name}`)

        browser.on('browser_process_failure', () => done(browser.error))

        browser.on('done', () => {
          if (!browser.error && browser.state !== browser.STATE_RESTARTING) {
            done(null, browser)
          }
        })

        browser.start(`${protocol}//${hostname}:${port}${urlRoot}`)
      }, [])

      this.jobs.run()
      this._browsers.push(browser)
    }
  }

  launch (names, concurrency) {
    log.info(`Launching browsers ${names.join(', ')} with concurrency ${concurrency === Infinity ? 'unlimited' : concurrency}`)
    this.jobs = new Jobs({ maxConcurrency: concurrency })

    this._lastStartTime = Date.now()

    if (this._server.loadErrors.length) {
      this.jobs.add((args, done) => done(), [])
    } else {
      names.forEach((name) => this._injector.invoke(this.launchSingle, this)(name))
    }

    this.jobs.on('end', (err) => {
      log.debug('Finished all browsers')

      if (err) {
        log.error(err)
      }
    })

    this.jobs.run()

    return this._browsers
  }

  kill (id, callback) {
    callback = callback || function () {}
    const browser = this.getBrowserById(id)

    if (browser) {
      browser.forceKill().then(callback)
      return true
    }
    process.nextTick(callback)
    return false
  }

  restart (id) {
    const browser = this.getBrowserById(id)
    if (browser) {
      browser.restart()
      return true
    }
    return false
  }

  killAll (callback) {
    callback = callback || function () {}
    log.debug('Disconnecting all browsers')

    if (!this._browsers.length) {
      return process.nextTick(callback)
    }

    Promise.all(
      this._browsers
        .map((browser) => browser.forceKill())
    ).then(callback)
  }

  areAllCaptured () {
    return this._browsers.every((browser) => browser.isCaptured())
  }

  markCaptured (id) {
    const browser = this.getBrowserById(id)
    if (browser) {
      browser.markCaptured()
      log.debug(`${browser.name} (id ${browser.id}) captured in ${(Date.now() - this._lastStartTime) / 1000} secs`)
    }
  }

  static generateId () {
    return Math.floor(Math.random() * 100000000).toString()
  }
}

Launcher.factory = function (server, emitter, injector) {
  return new Launcher(server, emitter, injector)
}

Launcher.factory.$inject = ['server', 'emitter', 'injector']

exports.Launcher = Launcher
