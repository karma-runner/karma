var log = require('./logger').create('launcher');

var BaseBrowser = require('./launchers/Base');


var ScriptBrowser = function(id, script) {
  BaseBrowser.apply(this, arguments);

  this.name = script;

  this._getCommand = function() {
    return script;
  };
};


var Launcher = function() {
  var browsers = [];


  this.launch = function(names, port, urlRoot) {
    var url = 'http://localhost:' + port + urlRoot;
    var Cls, browser;

    names.forEach(function(name) {
      Cls = exports[name + 'Browser'] || ScriptBrowser;
      browser = new Cls(Launcher.generateId(), name);

      log.info('Starting  browser "%s"', browser.name || 'Custom');
      browser.start(url + '?id=' + browser.id);
      browsers.push(browser);
    });
  };


  this.kill = function(callback) {
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
      return !browser.isCaptured;
    });
  };


  this.markCaptured = function(id) {
    browsers.forEach(function(browser) {
      if (browser.id === id) {
        browser.isCaptured = true;
      }
    });
  };
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
