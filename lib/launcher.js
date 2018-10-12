'use strict'

const Promise = require('bluebird')
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

function Launcher (server, emitter, injector) {
  this._browsers = []
  let lastStartTime

  const getBrowserById = (id) => this._browsers.find((browser) => browser.id === id)

  this.launchSingle = (protocol, hostname, port, urlRoot, upstreamProxy, processKillTimeout) => {
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
        browser = injector.createChild([locals], ['launcher:' + name]).get('launcher:' + name)
      } catch (e) {
        if (e.message.includes(`No provider for "launcher:${name}"`)) {
          log.error(`Cannot load browser "${name}": it is not registered! Perhaps you are missing some plugin?`)
        } else {
          log.error(`Cannot load browser "${name}"!\n  ` + e.stack)
        }

        emitter.emit('load_error', 'launcher', name)
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

  this.launch = (names, concurrency) => {
    log.info(`Launching browsers ${names.join(', ')} with concurrency ${concurrency === Infinity ? 'unlimited' : concurrency}`)
    this.jobs = new Jobs({ maxConcurrency: concurrency })

    lastStartTime = Date.now()

    if (server.loadErrors.length) {
      this.jobs.add((args, done) => done(), [])
    } else {
      names.forEach((name) => injector.invoke(this.launchSingle, this)(name))
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

  this.launch.$inject = [
    'config.browsers',
    'config.concurrency',
    'config.processKillTimeout'
  ]

  this.launchSingle.$inject = [
    'config.protocol',
    'config.hostname',
    'config.port',
    'config.urlRoot',
    'config.upstreamProxy',
    'config.processKillTimeout'
  ]

  this.kill = (id, callback) => {
    callback = callback || function () {}
    const browser = getBrowserById(id)

    if (browser) {
      browser.forceKill().then(callback)
      return true
    }
    process.nextTick(callback)
    return false
  }

  this.restart = (id) => {
    const browser = getBrowserById(id)
    if (browser) {
      browser.restart()
      return true
    }
    return false
  }

  this.killAll = (callback) => {
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

  this.areAllCaptured = () => this._browsers.every((browser) => browser.isCaptured())

  this.markCaptured = (id) => {
    const browser = getBrowserById(id)
    if (browser) {
      browser.markCaptured()
      log.debug(`${browser.name} (id ${browser.id}) captured in ${(Date.now() - lastStartTime) / 1000} secs`)
    }
  }

  emitter.on('exit', this.killAll)
}

Launcher.$inject = ['server', 'emitter', 'injector']
Launcher.generateId = () => Math.floor(Math.random() * 100000000).toString()

exports.Launcher = Launcher
