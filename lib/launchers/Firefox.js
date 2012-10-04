var spawn = require('child_process').spawn;
var log = require('../logger').create('launcher');
var fs = require('fs');

var BaseBrowser = require('./Base');


var PREFS =
    'user_pref("browser.shell.checkDefaultBrowser", false);\n' +
    'user_pref("browser.bookmarks.restore_default_bookmarks", false);\n';

// https://developer.mozilla.org/en-US/docs/Command_Line_Options
var FirefoxBrowser = function(id) {
  BaseBrowser.apply(this, arguments);

  this._start = function(url) {
    var self = this;
    var command = this._getCommand();
    var errorOutput = '';

    var p = spawn(command, ['-CreateProfile', 'testacular-' + id + ' ' + self._tempDir, '-no-remote']);

    p.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    p.on('close', function() {
      var match = /at\s\'(.*)[\/\\]prefs\.js\'/.exec(errorOutput);

      if (match) {
        self._tempDir = match[1];
      }

      fs.createWriteStream(self._tempDir + '/prefs.js', {flags: 'a'}).write(PREFS);
      self._execCommand(command, [url, '-profile', self._tempDir, '-no-remote']);
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
