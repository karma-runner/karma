var spawn = require('child_process').spawn;
var log = require('../logger').create('launcher');
var fs = require('fs');

var BaseBrowser = require('./Base');


var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n';

var FirefoxBrowser = function(id) {
  BaseBrowser.apply(this, arguments);

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

        fs.createWriteStream(profile + '/prefs.js', {flags: 'a'}).write(PREFS);
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


// PUBLISH
module.exports = FirefoxBrowser;
