var BaseBrowser = require('./Base');


var ChromeBrowser = function() {
  BaseBrowser.apply(this, arguments);

  this._getOptions = function(url) {
    // Chrome CLI options
    // http://peter.sh/experiments/chromium-command-line-switches/
    return [
      '--user-data-dir=' + this._tempDir,
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-default-apps',
      '--start-maximized',
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


// PUBLISH
module.exports = ChromeBrowser;
