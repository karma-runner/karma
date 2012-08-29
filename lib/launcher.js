var exec = require('child_process').exec;
var path = require('path');
var log = require('./logger').create('launcher');
var env = process.env;
var fs = require('fs');
var util = require('./util');

var counter = 1;

// inspired by https://github.com/admc/jellyfish/blob/master/lib/browsers.js
var Browser = function(id) {

  var exitCallback = function() {};

  this._getCommand = function() {
    var cmd = env[this.ENV_CMD] || this.DEFAULT_CMD[process.platform];
    return '"' + path.normalize(cmd) + '"';
  };

  this._execCommand = function(cmd) {
    // TODO(vojta): show some errors if cmd does not exists...
    log.debug(cmd);
    this._process = exec(cmd, function(e) {
      if (e && !e.killed) {
        log.error(e);
      }
    });

    var tempDir = this._tempDir;
    this._process.on('exit', function() {
      log.debug('Cleaning the profile at %s', tempDir);
      exec('rm -rdf ' + tempDir, exitCallback);
    });
  };

  this._getOptions = function(url) {
    return [url];
  };

  this._tempDir = (env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/testacular-' + id.toString();

  try {
    log.debug('Creating temp dir at ' + this._tempDir);
    fs.mkdirSync(this._tempDir);
  } catch (e) {}


  this.start = function(url) {
    this._execCommand(this._getCommand() + ' ' + this._getOptions(url).join(' '));
  };

  this.kill = function(callback) {
    exitCallback = callback || function() {};

    if (this._process.exitCode === null) {
      this._process.kill();
    } else {
      process.nextTick(exitCallback);
    }
  };
};


var ChromeBrowser = function() {
  Browser.apply(this, arguments);

  this._getOptions = function(url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    return [
      '--user-data-dir=' + this._tempDir,
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      url
    ];
  };
};

ChromeBrowser.prototype = {
  name: 'Chrome',

  DEFAULT_CMD: {
    linux: '/usr/bin/google-chrome',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  },
  ENV_CMD: 'CHROME_BIN'
};


var ChromeCanaryBrowser = function() {
  ChromeBrowser.apply(this, arguments);
};

ChromeCanaryBrowser.prototype = {
  name: 'ChromeCanary',

  DEFAULT_CMD: {
    linux: '/usr/bin/google-chrome-canary',
    darwin: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    win32: process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe'
  },
  ENV_CMD: 'CHROME_CANARY_BIN'
};


var FirefoxBrowser = function() {
  Browser.apply(this, arguments);

  this.start = function(url) {
    var self = this;
    var command = this._getCommand();

    // create profile first
    exec(command + ' -CreateProfile testacular', function(e, stdout, stderr) {
      if (e) {
        log.error(e);
      }

      var match = /at\s\'(.*)\/prefs\.js\'/.exec(stderr.toString());

      if (match) {
        var profile = self._tempDir = match[1];
        var prefs = 'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
                    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n';

        fs.createWriteStream(profile + '/prefs.js', {flags: 'a'}).write(prefs);
        self._execCommand(command + ' -profile "' + profile + '" ' + url);
      } else {
        log.warn('Can not create Firefox profile');
        self._execCommand(command + ' ' + url);
      }
    });
  };
};

FirefoxBrowser.prototype = {
  name: 'Firefox',

  DEFAULT_CMD: {
    linux: '/usr/bin/firefox',
    darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
    win32: process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe'
  },
  ENV_CMD: 'FIREFOX_BIN'
};


var OperaBrowser = function() {
  Browser.apply(this, arguments);

  this._getOptions = function(url) {
    // Opera CLI options
    // http://www.opera.com/docs/switches/
    return [
      '-personaldir ' + this._tempDir,
      '-nomail',
      url
    ];
  };
};

OperaBrowser.prototype = {
  name: 'Opera',

  DEFAULT_CMD: {
    linux: '/usr/bin/opera',
    darwin: '/Applications/Opera.app/Contents/MacOS/Opera',
    win32: process.env.ProgramFiles + '\\Opera\\opera.exe'
  },
  ENV_CMD: 'OPERA_BIN'
};


var SafariBrowser = function() {
  Browser.apply(this, arguments);

  this.start = function(url) {
    var HTML_TPL = path.normalize(__dirname + '/../static/safari.html');
    var self = this;

    fs.readFile(HTML_TPL, function(err, data) {
      var content = data.toString().replace('%URL%', url);
      var staticHtmlPath = self._tempDir + '/redirect.html';

      fs.writeFile(staticHtmlPath, content, function(err) {
        self._execCommand(self._getCommand() + ' ' + staticHtmlPath);
      });
    });
  };
};

SafariBrowser.prototype = {
  name: 'Safari',

  DEFAULT_CMD: {
    darwin: '/Applications/Safari.app/Contents/MacOS/Safari'
  },
  ENV_CMD: 'SAFARI_BIN'
};


var PhantomJSBrowser = function() {
  Browser.apply(this, arguments);

  this.start = function(url) {
    // create the js file, that will open testacular
    var captureFile = this._tempDir + '/capture.js';
    var captureCode = '(new WebPage()).open("' + url + '");';
    fs.createWriteStream(captureFile).end(captureCode);

    // and start phantomjs
    this._execCommand(this._getCommand() + ' ' + captureFile);
  };
};

PhantomJSBrowser.prototype = {
  name: 'PhantomJS',

  DEFAULT_CMD: {
    linux: '/usr/bin/phantomjs',
    darwin: '/usr/local/bin/phantomjs'
  },
  ENV_CMD: 'PHANTOMJS_BIN'
};


var Launcher = function() {
  var browsers = [];

  this.launch = function(names, port, urlRoot) {
    var url = 'http://localhost:' + port + urlRoot;
    var Cls, browser, id;

    names.forEach(function(nameOrCls) {
      id = counter++;

      if (util.isString(nameOrCls)) {
        Cls = exports[nameOrCls + 'Browser'];
        if (!Cls) {
          throw new Error('Browser "' + nameOrCls + '" does not exists');
        }
      } else if (util.isFunction(nameOrCls)) {
        Cls = nameOrCls;
      }

      browser = new Cls(id);
      browser.id = id;
      browser.isCaptured = false;

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


exports.Launcher = Launcher;
exports.BaseBrowser = Browser;
exports.ChromeBrowser = ChromeBrowser;
exports.ChromeCanaryBrowser = ChromeCanaryBrowser;
exports.FirefoxBrowser = FirefoxBrowser;
exports.OperaBrowser = OperaBrowser;
exports.SafariBrowser = SafariBrowser;
exports.PhantomJSBrowser = PhantomJSBrowser;
