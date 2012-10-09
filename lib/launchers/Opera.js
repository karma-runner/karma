var fs = require('fs');

var BaseBrowser = require('./Base');


var PREFS =
    'Opera Preferences version 2.1\n\n' +
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
    'Ask For Usage Stats Percentage=0\n' +
    'Enable Usage Statistics=0\n' +
    'Disable Opera Package AutoUpdate=1\n' +
    'Browser JavaScript=0\n\n' + // site-patches by Opera delivred through auto-update
    '[Install]\n' +
    'Newest Used Version=1.00.0000\n\n' +
    '[State]\n' +
    'Accept License=1\n' +
    'Run=0\n';


var OperaBrowser = function() {
  BaseBrowser.apply(this, arguments);

  this._getOptions = function(url) {
    // Opera CLI options
    // http://www.opera.com/docs/switches/
    return [
      '-pd', this._tempDir,
      '-nomail',
      url
    ];
  };

  this._start = function(url) {
    var self = this;

    var prefsFile = this._tempDir + '/operaprefs.ini';
    fs.writeFile(prefsFile, PREFS, function(err) {
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


// PUBLISH
module.exports = OperaBrowser;
