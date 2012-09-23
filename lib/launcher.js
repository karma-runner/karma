var spawn = require('child_process').spawn;
var path = require('path');
var log = require('./logger').create('launcher');
var env = process.env;
var fs = require('fs');
var util = require('./util');


var generate = {
  id: function() {
    return Math.floor(Math.random() * 100000000);
  }
};


// inspired by https://github.com/admc/jellyfish/blob/master/lib/browsers.js
var Browser = function(id) {

  var exitCallback = function() {};

  this._getCommand = function() {
    return path.normalize(env[this.ENV_CMD] || this.DEFAULT_CMD[process.platform]);
  };

  this._execCommand = function(cmd, args) {
    log.debug(cmd + ' ' + args.join(' '));
    this._process = spawn(cmd, args);

    var errorOutput = '';
    this._process.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    var self = this;
    this._process.on('exit', function(code) {
      if (code) {
        log.error('Cannot start %s\n\t%s', self.name, errorOutput);
      }

      log.debug('Cleaning %s', self._tempDir);
      spawn('rm', ['-rf', self._tempDir]).on('exit', exitCallback);
    });
  };

  this._getOptions = function(url) {
    return [url];
  };

  this.id = id;
  this.isCaptured = false;

  this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/testacular-' + id.toString());

  try {
    log.debug('Creating temp dir at ' + this._tempDir);
    fs.mkdirSync(this._tempDir);
  } catch (e) {}


  this.start = function(url) {
    this._execCommand(this._getCommand(), this._getOptions(url));
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
    linux: 'google-chrome',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  },
  ENV_CMD: 'CHROME_BIN'
};


var ChromeCanaryBrowser = function() {
  ChromeBrowser.apply(this, arguments);

  var parentOptions = this._getOptions;
  this._getOptions = function(url) {
    // disable crankshaft optimizations, as it causes lot of memory leaks (as of Chrome 23.0)
    return parentOptions.call(this, url).concat(['--js-flags="--nocrankshaft --noopt"']);
  };
};

ChromeCanaryBrowser.prototype = {
  name: 'ChromeCanary',

  DEFAULT_CMD: {
    linux: 'google-chrome-canary',
    darwin: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    win32: process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe'
  },
  ENV_CMD: 'CHROME_CANARY_BIN'
};


var FirefoxBrowser = function(id) {
  Browser.apply(this, arguments);

  this.start = function(url) {
    var self = this;
    var command = this._getCommand();
    var errorOutput = '';

    // passing url, because on Windows and Linux, -CreateProfile is ignored and started FF
    // (if there is already any running instance)
    var p = spawn(command, ['-CreateProfile', 'testacular-' + id + ' ' + self._tempDir, url]);

    p.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    p.on('exit', function() {
      var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput);

      if (match) {
        var profile = self._tempDir = match[1];
        var prefs = 'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
                    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n';

        fs.createWriteStream(profile + '/prefs.js', {flags: 'a'}).write(prefs);
        self._execCommand(command, ['-profile', profile, url]);
      } else {
        // we don't have to start Firefox, as -CreateProfile cmd probably already did
        log.warn('Cannot create Firefox profile, reusing current.');
      }
    });
  };
};

FirefoxBrowser.prototype = {
  name: 'Firefox',

  DEFAULT_CMD: {
    linux: 'firefox',
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
      '-pd', this._tempDir,
      '-nomail',
      url
    ];
  };

  this.start = function(url) {
    var self = this;
    var prefs = 'Opera Preferences version 2.1\n' +
      '[User Prefs]\n' +
      'Show Default Browser Dialog=0\n' +
      'Startup Type=2\n' + // use homepage
      'Home URL=about:blank\n' +
      'Show Close All But Active Dialog=0\n' +
      'Show Close All Dialog=0\n' +
      'Show Crash Log Upload Dialog=0\n' +
      'Show Delete Mail Dialog=0\n' +
      'Show Download Manager Selection Dialog=0\n' +
      'Show Geolocation License Dialog=0\n' +
      'Show Mail Error Dialog=0\n' +
      'Show New Opera Dialog=0\n' +
      'Show Problem Dialog=0\n' +
      'Show Progress Dialog=0\n' +
      'Show Validation Dialog=0\n' +
      'Show Widget Debug Info Dialog=0\n' +
      'Show Startup Dialog=0\n' +
      'Show E-mail Client=0\n' +
      'Show Mail Header Toolbar=0\n' +
      'Show Setupdialog On Start=0\n' +
      'Enable Usage Statistics=0\n' +
      '[Install]\n' +
      'Newest Used Version=1.00.0000\n' +
      '[State]\n' +
      'Accept License=1\n';

    var prefsFile = this._tempDir + '/operaprefs.ini';
    fs.writeFile(prefsFile, prefs, function(err) {
      // TODO(vojta): handle error
      self._execCommand(self._getCommand(), self._getOptions(url));
    });
  };
};

OperaBrowser.prototype = {
  name: 'Opera',

  DEFAULT_CMD: {
    linux: 'opera',
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
        self._execCommand(self._getCommand(), [staticHtmlPath]);
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
    this._execCommand(this._getCommand(), [captureFile]);
  };
};

PhantomJSBrowser.prototype = {
  name: 'PhantomJS',

  DEFAULT_CMD: {
    linux: 'phantomjs',
    darwin: '/usr/local/bin/phantomjs',
    win32: process.env.ProgramFiles + '\\PhantomJS\\phantomjs.exe'
  },
  ENV_CMD: 'PHANTOMJS_BIN'
};


var IEBrowser = function() {
  Browser.apply(this, arguments);
};

IEBrowser.prototype = {
  name: 'IE',
  DEFAULT_CMD: {
    win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
  },
  ENV_CMD: 'IE_BIN'
};


var ScriptBrowser = function(id, script) {
  Browser.apply(this, arguments);

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
      browser = new Cls(generate.id(), name);

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
exports.IEBrowser = IEBrowser;
