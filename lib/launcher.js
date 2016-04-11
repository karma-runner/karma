var Promise = require('bluebird')
var Jobs = require('qjobs')

var helper = require('./helper')
var log = require('./logger').create('launcher')

var baseDecorator = require('./launchers/base').decoratorFactory
var captureTimeoutDecorator = require('./launchers/capture_timeout').decoratorFactory
var retryDecorator = require('./launchers/retry').decoratorFactory
var processDecorator = require('./launchers/process').decoratorFactory

// TODO(vojta): remove once nobody uses it
var baseBrowserDecoratorFactory = function (
  baseLauncherDecorator,
  captureTimeoutLauncherDecorator,
  retryLauncherDecorator,
  processLauncherDecorator
) {
  return function (launcher) {
    baseLauncherDecorator(launcher)
    captureTimeoutLauncherDecorator(launcher)
    retryLauncherDecorator(launcher)
    processLauncherDecorator(launcher)
  }
}

var Launcher = function (server, emitter, injector) {
  this._browsers = []
  var lastStartTime
  var self = this

  var getBrowserById = function (id) {
    for (var i = 0; i < self._browsers.length; i++) {
      if (self._browsers[i].id === id) {
        return self._browsers[i]
      }
    }

    return null
  }

  this.launchSingle = function (protocol, hostname, port, urlRoot) {
    var self = this
    return function (name) {
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
        var browser = injector.createChild([locals], ['launcher:' + name]).get('launcher:' + name)
      } catch (e) {
        if (e.message.indexOf('No provider for "launcher:' + name + '"') !== -1) {
          log.error('Cannot load browser "%s": it is not registered! ' +
            'Perhaps you are missing some plugin?', name)
        } else {
          log.error('Cannot load browser "%s"!\n  ' + e.stack, name)
        }

        emitter.emit('load_error', 'launcher', name)
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

      self.jobs.add(function (args, done) {
        log.info('Starting browser %s', helper.isDefined(browser.displayName) ? browser.displayName : browser.name)

        browser.on('browser_process_failure', function () {
          done(browser.error)
        })

        browser.on('done', function () {
          // We are not done if there was an error as first the retry takes
          // place which we catch with `browser_process_failure` if it fails
          if (browser.error) return

          done(null, browser)
        })

        browser.start(url)
      }, [])

      self.jobs.run()
      self._browsers.push(browser)
    }
  }

  this.launch = function (names, concurrency) {
    log.info(
      'Launching browser%s %s with %s',
      names.length > 1 ? 's' : '',
      names.join(', '),
      concurrency === Infinity ? 'unlimited concurrency' : 'concurrency ' + concurrency
    )
    this.jobs = new Jobs({maxConcurrency: concurrency})

    var self = this
    lastStartTime = Date.now()

    if (server.loadErrors.length === 0) {
      names.forEach(function (name) {
        injector.invoke(self.launchSingle, self)(name)
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

    return self._browsers
  }

  this.launch.$inject = [
    'config.browsers',
    'config.concurrency'
  ]

  this.launchSingle.$inject = [
    'config.protocol',
    'config.hostname',
    'config.port',
    'config.urlRoot'
  ]

  this.kill = function (id, callback) {
    var browser = getBrowserById(id)
    callback = callback || function () {}

    if (!browser) {
      process.nextTick(callback)
      return false
    }

    browser.forceKill().then(callback)
    return true
  }

  this.restart = function (id) {
    var browser = getBrowserById(id)

    if (!browser) {
      return false
    }

    browser.restart()
    return true
  }

  this.killAll = function (callback) {
    log.debug('Disconnecting all browsers')

    var remaining = 0
    var finish = function () {
      remaining--
      if (!remaining && callback) {
        callback()
      }
    }

    if (!self._browsers.length) {
      return process.nextTick(callback)
    }

    self._browsers.forEach(function (browser) {
      remaining++
      browser.forceKill().then(finish)
    })
  }

  this.areAllCaptured = function () {
    return !self._browsers.some(function (browser) {
      return !browser.isCaptured()
    })
  }

  this.markCaptured = function (id) {
    self._browsers.forEach(function (browser) {
      if (browser.id === id) {
        browser.markCaptured()
        log.debug('%s (id %s) captured in %d secs', browser.name, browser.id,
          (Date.now() - lastStartTime) / 1000)
      }
    })
  }

  // register events
  emitter.on('exit', this.killAll)
}

Launcher.$inject = ['server', 'emitter', 'injector']

Launcher.generateId = function () {
  return '' + Math.floor(Math.random() * 100000000)
}

// PUBLISH
exports.Launcher = Launcher
