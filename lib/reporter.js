var util = require('util');
var u = require('./util');


var renderBrowser = function(browser) {
  var totalExecuted = browser.lastResult.success + browser.lastResult.failed;
  var msg = util.format('%s: Executed %d of %d', browser, totalExecuted, browser.lastResult.total);

  if (browser.lastResult.failed) {
    msg += ' \033[31m(' + browser.lastResult.failed + ' failed)\033[39m';
  }

  if (browser.isReady) {
    var skipped = browser.lastResult.total - totalExecuted;
    if (skipped) {
      msg += util.format(' (skipped %d)', skipped);
    }

    if (browser.lastResult.disconnected) {
      msg += ' \033[31mDISCONNECTED\033[39m';
    } else if (browser.lastResult.error) {
      msg += ' \033[31mERROR\033[39m';
    } else if (!browser.lastResult.failed) {
      msg += ' \033[32mSUCCESS\033[39m';
    }
  }

  return msg;
};


var ProgressBarRenderer = function(browsers) {
  var isRendered = false;

  this.remove = function() {
    if (!isRendered) return '';

    var cmd = '';
    browsers.forEach(function() {
      cmd += '\033[1A' + '\033[2K';
    });

    isRendered = false;

    return cmd;
  };

  this.render = function() {
    isRendered = true;

    return browsers.map(renderBrowser).join('\n') + '\n';
  };

  this.refresh = function() {
    return this.remove() + this.render();
  };
};


var Progress = function(adapter) {
  var renderer;

  // default adapter - write to stdout
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)];


  this.write = function() {
    var msg = util.format.apply(null, Array.prototype.slice.call(arguments));

    this.adapters.forEach(function(adapter) {
      adapter(msg);
    });
  };

  this.writeCommonMsg = function(msg) {
    this.write(renderer.remove() + msg + renderer.render());
  };


  this.onBrowserError = function(browser, error) {
    this.writeCommonMsg('\033[31m' + browser + ' ERROR\033[39m\n' + u.formatError(error, '\t'));
  };


  this.onBrowserDump = function(browser, dump) {
    var msg = browser + ' DUMP: ';

    if (dump.length > 1) {
      msg += dump.length + ' entries\n' + dump.join('\n');
    } else {
      msg += dump[0];
    }

    this.writeCommonMsg(msg + '\n');
  };


  this.onSpecComplete = function(browser, result) {
    if (result.success) {
      this.write(renderer.refresh(browser));
    } else {
      var specName = result.suite.join(' ') + ' ' + result.description;
      var msg = '\033[31m' + browser.name + ' ' + specName + ' FAILED\033[39m' + '\n';
      result.log.forEach(function(log) {
        msg += u.formatError(log, '\t');
      });

      this.writeCommonMsg(msg, browser);
    }
  };


  this.onBrowserComplete = function(browser) {
    this.write(renderer.refresh());
  };


  this.onRunStart = function(browsers) {
    renderer = new ProgressBarRenderer(browsers);
    this.write('\n');
  };

  this.onRunComplete = function(browsers, results) {
    if (browsers.length > 1) {
      if (!results.failed) {
        this.write('\033[32mTOTAL: %d SUCCESS\033[39m\n', results.success);
      } else {
        this.write('\033[31mTOTAL: %d FAILED, %d SUCCESS\033[39m\n', results.failed, results.success);
      }
    }
  };
};

var Dots = function(adapter) {
  Progress.call(this, adapter);

  var browsers;

  this.onRunStart = function(browsers_) {
    browsers = browsers_;
  };

  this.writeCommonMsg = function(msg) {
    this.write('\n' + msg);
  };

  this.onSpecComplete = function(browser, result)  {
    if (result.success) {
      this.write('.');
    } else {
      var specName = result.suite.join(' ') + ' ' + result.description;
      var msg = '\033[31m' + browser.name + ' ' + specName + ' FAILED\033[39m' + '\n';
      result.log.forEach(function(log) {
        msg += u.formatError(log, '\t');
      });

      this.writeCommonMsg(msg, browser);
    }
  };

  this.onBrowserComplete = function(browser) {
    this.writeCommonMsg(browsers.map(renderBrowser).join('\n') + '\n');
  };
};


// PUBLISH
exports.Progress = Progress;
exports.Dots = Dots;
