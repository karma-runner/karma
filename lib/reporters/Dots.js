var BaseReporter = require('./Base');


var DotsReporter = function(formatError, reportSlow) {
  BaseReporter.call(this, formatError, reportSlow);

  var DOTS_WRAP = 80;

  this.onRunStart = function(browsers) {
    this.browsers_ = browsers;
    this.dotsCount_ = 0;
  };

  this.writeCommonMsg = function(msg) {
    this.write('\n' + msg);
    this.dotsCount_ = 0;
  };


  this.specSuccess = function() {
    this.dotsCount_ = (this.dotsCount_ + 1) % DOTS_WRAP;
    this.write(this.dotsCount_ ? '.' : '.\n');
  };

  this.onRunComplete = function(browsers, results) {
    this.writeCommonMsg(browsers.map(this.renderBrowser).join('\n') + '\n');

    if (browsers.length > 1 && !results.disconnected && !results.error) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success);
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success);
      }
    }
  };
};


// PUBLISH
module.exports = DotsReporter;
