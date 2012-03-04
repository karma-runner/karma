var format = require('util').format;
var util = require('./util');


var renderBrowser = function(browser) {
  var totalExecuted = browser.lastResult.success + browser.lastResult.failed;
  var msg = format('%s: Executed %d of %d', browser, totalExecuted, browser.lastResult.total);

  if (browser.lastResult.failed) {
    msg += ' \033[31m(' + browser.lastResult.failed + ' failed)\033[39m';
  }

  if (browser.isReady) {
    var skipped = browser.lastResult.total - totalExecuted;
    if (skipped) {
      msg += format(' (skipped %d)', skipped);
    }

    if (!browser.lastResult.failed) {
      msg += ' \033[32mSUCCESS\033[39m';
    }
  }

  return msg;
};


var ProgressBarRenderer = function() {
  var browsers = [];

  this.remove = function() {
    var cmd = '';
    browsers.forEach(function() {
      cmd += '\033[1A' + '\033[2K';
    });

    return cmd;
  };

  this.render = function(browser) {
    if (browser && browsers.indexOf(browser) === -1) {
      browsers.push(browser);
    }

    return browsers.map(renderBrowser).join('\n') + '\n';
  };

  this.refresh = function(browser) {
    return this.remove() + this.render(browser);
  };
};


var Progress = function(adapter) {
  var renderer = new ProgressBarRenderer();

  // default adapter - write to stdou
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)];


  this.write = function() {
    var msg = format.apply(null, Array.prototype.slice.call(arguments));

    this.adapters.forEach(function(adapter) {
      adapter(msg);
    });
  };


  this.error = function(browser, error) {
    var msg = '\033[31m' + browser.name + ' ERROR\033[39m\n' + util.formatError(error, '\t');

    this.write(renderer.remove() + msg + renderer.render());
  };


  this.dump = function(browser, dump) {};


  this.specComplete = function(browser, result) {
    if (result.success) {
      this.write(renderer.refresh(browser));
    } else {
      var specName = result.suite.join('.') + ' ' + result.description;
      var msg = '\033[31m' + browser.name + ' ' + specName + ' FAILED\033[39m' + '\n';
      result.log.forEach(function(log) {
        msg += util.formatError(log, '\t') + '\n';
      });

      this.write(renderer.remove() + msg + renderer.render(browser));
    }
  };


  this.browserComplete = function(browser) {
    this.write(renderer.refresh());
  };


  this.runStart = function(browsers) {
    renderer = new ProgressBarRenderer();
    this.write('\n');
  };

  this.runComplete = function(browsers) {
    if (browsers.length > 1) {
      var total = browsers.getResults();
      if (!total.failed) {
        this.write('\033[32mTOTAL: %d SUCCESS\033[39m\n', total.success);
      } else {
        this.write('\033[31mTOTAL: %d FAILED, %d SUCCESS\033[39m\n', total.failed, total.success);
      }
    }
  };
};


// PUBLISH
exports.Progress = Progress;