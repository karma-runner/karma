var fs = require('fs');

var BaseBrowser = require('./Base');


var PhantomJSBrowser = function() {
  BaseBrowser.apply(this, arguments);

  this._start = function(url) {
    // create the js file, that will open testacular
    var captureFile = this._tempDir + '/capture.js';
    var captureCode = '(new WebPage()).open("' + url + '");';
    fs.writeFileSync(captureFile, captureCode);

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


// PUBLISH
module.exports = PhantomJSBrowser;
