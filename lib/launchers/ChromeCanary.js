var ChromeBrowser = require('./Chrome');


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


// PUBLISH
module.exports = ChromeCanaryBrowser;
