var fs = require('fs');

var BaseBrowser = require('./Base');


var PhantomJSBrowser = function() {
  BaseBrowser.apply(this, arguments);

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
   //this will use the path provided in the config file or use the one in PATH (as per issue #72)
    win32: config.winPhantomJSPath ? path.resolve(config.winPhantomJSPath) : 'phantomjs' 
  },
  ENV_CMD: 'PHANTOMJS_BIN'
};


// PUBLISH
module.exports = PhantomJSBrowser;
