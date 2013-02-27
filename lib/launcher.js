var log = require('./logger').create('launcher');
var BaseBrowser = require('./launchers/Base');


var ScriptBrowser = function(id, emitter, timeout, retry, browserConfig) {
  BaseBrowser.apply(this, arguments);

  this.name = browserConfig.cmd;

  this._getCommand = function() {
    return browserConfig.cmd;
  };
};


var Launcher = function(emitter) {
  var browsers = [];


  this.launch = function(browserConfigs, hostname, port, urlRoot, timeout, retryLimit) {
    var url = 'http://' + hostname + ':' + port + urlRoot;
    var Cls, browser;

    browserConfigs.forEach(function(browserConfig) {
      var name = browserConfig.name;
      Cls = exports[name + 'Browser'] || ScriptBrowser;
      browser = new Cls(Launcher.generateId(), emitter, timeout, retryLimit, browserConfig);

      log.info('Starting browser %s', browser.name);

      browser.start(url);
      browsers.push(browser);
    });
  };


  this.kill = function(callback) {
    log.debug('Disconnecting all browsers');

    var remaining = 0;
    var finish = function() {
      remaining--;
      if (!remaining && callback) {
        callback();
      }
    };

    if (!browsers.length) {
      return process.nextTick(callback);
    }

    browsers.forEach(function(browser) {
      remaining++;
      browser.kill(finish);
    });
  };


  this.areAllCaptured = function() {
    return !browsers.some(function(browser) {
      return !browser.isCaptured();
    });
  };


  this.markCaptured = function(id) {
    browsers.forEach(function(browser) {
      if (browser.id === id) {
        browser.markCaptured();
      }
    });
  };


  // register events
  emitter.on('exit', this.kill);
};

Launcher.generateId = function() {
  return Math.floor(Math.random() * 100000000);
};


// PUBLISH
exports.Launcher = Launcher;

exports.ChromeBrowser       = require('./launchers/Chrome');
exports.ChromeCanaryBrowser = require('./launchers/ChromeCanary');
exports.FirefoxBrowser      = require('./launchers/Firefox');
exports.IEBrowser           = require('./launchers/IE');
exports.OperaBrowser        = require('./launchers/Opera');
exports.PhantomJSBrowser    = require('./launchers/PhantomJS');
exports.SafariBrowser       = require('./launchers/Safari');
