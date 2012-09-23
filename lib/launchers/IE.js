var BaseBrowser = require('./Base');

var IEBrowser = function() {
  BaseBrowser.apply(this, arguments);
};

IEBrowser.prototype = {
  name: 'IE',
  DEFAULT_CMD: {
    win32: process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe'
  },
  ENV_CMD: 'IE_BIN'
};


// PUBLISH
module.exports = IEBrowser;
