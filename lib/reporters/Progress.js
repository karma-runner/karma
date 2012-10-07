var BaseReporter = require('./Base');


var ProgressReporter = function(formatError, reportSlow) {
  BaseReporter.call(this, formatError, reportSlow);


  this.writeCommonMsg = function(msg) {
    this.write(this.remove_() + msg + this.render_());
  };


  this.specSuccess = function(browser) {
    this.write(this.refresh_());
  };


  this.onBrowserComplete = function(browser) {
    this.write(this.refresh_());
  };


  this.onRunStart = function(browsers) {
    this.browsers_ = browsers;
    this.isRendered_ = false;
  };


  this.remove_ = function() {
    if (!this.isRendered_) {
      return '';
    }

    var cmd = '';
    this.browsers_.forEach(function() {
      cmd += '\x1B[1A' + '\x1B[2K';
    });

    this.isRendered_ = false;

    return cmd;
  };

  this.render_ = function() {
    this.isRendered_ = true;

    return this.browsers_.map(this.renderBrowser).join('\n') + '\n';
  };

  this.refresh_ = function() {
    return this.remove_() + this.render_();
  };
};


// PUBLISH
module.exports = ProgressReporter;
