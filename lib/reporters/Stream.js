var util = require('util');
var BaseReporter = require('./Base');


var StreamReporter = function(formatError, reportSlow) {
  BaseReporter.call(this, formatError, reportSlow);

  this.specSuccess = function(browser) {
    this.write(this._render());
  };

  this.onBrowserComplete = function(browser) {
    this.write(this._render());
  };


  this.onRunStart = function(browsers) {
    this._browsers = browsers;
  };

  this._render = function() {
    return this._browsers.map(this.renderBrowser).join('\n') + '\n';
  };
};


// PUBLISH
module.exports = StreamReporter;
