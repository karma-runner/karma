var format = require('util').format;
var util = require('./util');

var Progress = function(adapter) {

  // default adapter - write to stdou
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)];


  this.write = function() {
    var msg = format.apply(null, Array.prototype.slice.call(arguments));

    this.adapters.forEach(function(adapter) {
      adapter(msg);
    });
  };


  this.error = function(browser, error) {
    this.write(util.formatError(error, '\t'));
  };


  this.dump = function(browser, dump) {};


  this.specComplete = function(browser, result) {
    if (result.success) {
      this.write('.');
    } else {
      var specName = result.suite.join('.') + ' ' + result.description;
      var msg = '\033[31m' + browser.name + ' ' + specName + ' FAILED\033[39m' + '\n';
      result.log.forEach(function(log) {
        msg += util.formatError(log, '\t') + '\n';
      });

      this.write(msg);
    }
  };


  this.browserComplete = function(browser) {
    var MSG = '\n%s: FAILED: %d PASSED: %d';
    this.write(MSG, browser, browser.lastResult.failed, browser.lastResult.success);
  };


  this.runComplete = function(browsers) {
    if (browsers.length > 1) {
      var results = browsers.getResults();
      this.write('\nTOTAL FAILED: %d SUCCESS: %d', results.failed, results.success);
    }

    this.write('\n');
  };
};


// PUBLISH
exports.Progress = Progress;