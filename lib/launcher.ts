import Promise = require('bluebird')
var Jobs = require('qjobs')

import helper = require('./helper')
import {create} from './logger'
var log = create('launcher')

import {BaseLauncher} from './launchers/base'
import {CaptureTimeoutLauncher} from './launchers/capture_timeout';
import {ProcessLauncher} from './launchers/process';
import {RetryLauncher} from './launchers/retry';

var baseDecorator = BaseLauncher.decoratorFactory
var captureTimeoutDecorator = CaptureTimeoutLauncher.decoratorFactory
var retryDecorator = RetryLauncher.decoratorFactory
var processDecorator = ProcessLauncher.decoratorFactory

// TODO(vojta): remove once nobody uses it
function baseBrowserDecoratorFactory(baseLauncherDecorator,
                                     captureTimeoutLauncherDecorator,
                                     retryLauncherDecorator,
                                     processLauncherDecorator) {
  return launcher => {
    baseLauncherDecorator(launcher)
    captureTimeoutLauncherDecorator(launcher)
    retryLauncherDecorator(launcher)
    processLauncherDecorator(launcher)
  }
}

export class Launcher {
  private jobs

  constructor(private server, private emitter, private injector) {

    this.launch.$inject = [
      'config.browsers',
      'config.concurrency'
    ];

    this.launchSingle.$inject = [
      'config.protocol',
      'config.hostname',
      'config.port',
      'config.urlRoot',
      'config.upstreamProxy'
    ];

    // register events
    emitter.on('exit', this.killAll)
  }

  private _browsers: Array<any> = []
  private lastStartTime

  private getBrowserById(id) {
    // return this._browsers.find(browser => browser.id === id)
    for (var i = 0; i < this._browsers.length; i++) {
      if (this._browsers[i].id === id) {
        return this._browsers[i]
      }
    }

    return null
  }

  launchSingle(protocol, hostname, port, urlRoot, upstreamProxy) {
    return (name) => {
      if (upstreamProxy) {
        protocol = upstreamProxy.protocol
        hostname = upstreamProxy.hostname
        port = upstreamProxy.port
        urlRoot = upstreamProxy.path + urlRoot.substr(1)
      }
      var url = protocol + '//' + hostname + ':' + port + urlRoot

      var locals = {
        id: ['value', Launcher.generateId()],
        name: ['value', name],
        baseLauncherDecorator: ['factory', baseDecorator],
        captureTimeoutLauncherDecorator: ['factory', captureTimeoutDecorator],
        retryLauncherDecorator: ['factory', retryDecorator],
        processLauncherDecorator: ['factory', processDecorator],
        baseBrowserDecorator: ['factory', baseBrowserDecoratorFactory]
      }

      // TODO(vojta): determine script from name
      if (name.indexOf('/') !== -1) {
        name = 'Script'
      }

      try {
        var browser = this.injector.createChild([locals], ['launcher:' + name]).get('launcher:' + name)
      } catch (e) {
        if (e.message.indexOf('No provider for "launcher:' + name + '"') !== -1) {
          log.error('Cannot load browser "%s": it is not registered! ' +
            'Perhaps you are missing some plugin?', name)
        } else {
          log.error('Cannot load browser "%s"!\n  ' + e.stack, name)
        }

        this.emitter.emit('load_error', 'launcher', name)
        return
      }

      // TODO(vojta): remove in v1.0 (BC for old launchers)
      if (!browser.forceKill) {
        browser.forceKill = function () {
          var me = this
          return new Promise(function (resolve) {
            me.kill(resolve)
          })
        }

        browser.restart = function () {
          var me = this
          this.kill(function () {
            me.start(url)
          })
        }
      }

      this.jobs.add(function (args, done) {
        log.info('Starting browser %s', helper.isDefined(browser.displayName) ? browser.displayName : browser.name)

        browser.on('browser_process_failure', function () {
          done(browser.error)
        })

        browser.on('done', function () {
          // We are not done if there was an error as first the retry takes
          // place which we catch with `browser_process_failure` if it fails
          if (browser.error || browser.state === browser.STATE_RESTARTING) return

          done(null, browser)
        })

        browser.start(url)
      }, [])

      this.jobs.run()
      this._browsers.push(browser)
    }
  }

  launch(names, concurrency) {
    log.info(
      'Launching browser%s %s with %s',
      names.length > 1 ? 's' : '',
      names.join(', '),
      concurrency === Infinity ? 'unlimited concurrency' : 'concurrency ' + concurrency
    )
    this.jobs = new Jobs({maxConcurrency: concurrency})

    this.lastStartTime = Date.now()

    if (this.server.loadErrors.length === 0) {
      names.forEach((name) => {
        this.injector.invoke(this.launchSingle, this)(name)
      })
    } else {
      // Empty task to ensure `end` is emitted
      this.jobs.add(function (args, done) {
        done()
      }, [])
    }

    this.jobs.on('end', function (err) {
      log.debug('Finished all browsers')

      if (err) {
        log.error(err)
      }
    })

    this.jobs.run()

    return this._browsers
  }

  kill(id, callback) {
    var browser = this.getBrowserById(id)
    callback = callback || function () {
      }

    if (!browser) {
      process.nextTick(callback)
      return false
    }

    browser.forceKill().then(callback)
    return true
  }

  restart(id) {
    var browser = this.getBrowserById(id)

    if (!browser) {
      return false
    }

    browser.restart()
    return true
  }

  killAll = (callback) => {
    log.debug('Disconnecting all browsers')

    var remaining = 0
    var finish = function () {
      remaining--
      if (!remaining && callback) {
        callback()
      }
    }

    if (!this._browsers.length) {
      return process.nextTick(callback)
    }

    this._browsers.forEach(function (browser) {
      remaining++
      browser.forceKill().then(finish)
    })
  }

  areAllCaptured() {
    return !this._browsers.some(function (browser) {
      return !browser.isCaptured()
    })
  }

  markCaptured(id) {
    this._browsers.forEach(browser => {
      if (browser.id === id) {
        browser.markCaptured()
        log.debug('%s (id %s) captured in %d secs', browser.name, browser.id,
          (Date.now() - this.lastStartTime) / 1000)
      }
    })
  }

  static $inject = ['server', 'emitter', 'injector']

  static generateId(): any {
    return '' + Math.floor(Math.random() * 100000000)
  }
}