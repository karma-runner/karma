var util = require('util');

var helper = require('../helper');


var BaseReporter = function(formatError, reportSlow, adapter) {
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)];

  this.onRunStart = function() {
    this._browsers = [];
  };

  this.onBrowserStart = function(browser) {
    this._browsers.push(browser);
  };

  this.renderBrowser = function(browser) {
    var results = browser.lastResult;
    var totalExecuted = results.success + results.failed;
    var msg = util.format('%s: Executed %d of %d', browser, totalExecuted, results.total);

    if (results.failed) {
      msg += util.format(this.X_FAILED, results.failed);
    }

    if (results.skipped) {
      msg += util.format(' (skipped %d)', results.skipped);
    }

    if (browser.isReady) {
      if (results.disconnected) {
        msg += this.FINISHED_DISCONNECTED;
      } else if (results.error) {
        msg += this.FINISHED_ERROR;
      } else if (!results.failed) {
        msg += this.FINISHED_SUCCESS;
      }

      msg += util.format(' (%s / %s)', helper.formatTimeInterval(results.totalTime),
                                       helper.formatTimeInterval(results.netTime));

      if (results.failed && results.total === totalExecuted) {
        msg += this._writeFailures(browser);
      }

    }

    return msg;
  };

  this.renderBrowser = this.renderBrowser.bind(this);


  this.write = function() {
    var msg = util.format.apply(null, Array.prototype.slice.call(arguments));

    this.adapters.forEach(function(adapter) {
      adapter(msg);
    });
  };

  this.writeCommonMsg = this.write;


  this.onBrowserError = function(browser, error) {
    this.writeCommonMsg(util.format(this.ERROR, browser) + formatError(error, '\t'));
  };


  this.onBrowserLog = function(browser, log, type) {
    if (!helper.isString(log)) {
      // TODO(vojta): change util to new syntax (config object)
      log = util.inspect(log, false, undefined, this.USE_COLORS);
    }

    if (this._browsers && this._browsers.length === 1) {
      this.writeCommonMsg(util.format(this.LOG_SINGLE_BROWSER, type.toUpperCase(), log));
    } else {
      this.writeCommonMsg(util.format(this.LOG_MULTI_BROWSER, browser, type.toUpperCase(), log));
    }
  };


  this.onSpecComplete = function(browser, result) {
    if (result.skipped) {
      this.specSkipped(browser, result);
    } else if (result.success) {
      this.specSuccess(browser, result);
    } else {
      this.specFailure(browser, result);
    }

    if (reportSlow && result.time > reportSlow) {
      var specName = result.suite.join(' ') + ' ' + result.description;
      var time = helper.formatTimeInterval(result.time);

      this.writeCommonMsg(util.format(this.SPEC_SLOW, browser, time, specName));
    }
  };


  this.specSuccess = this.specSkipped = function() {};


  function repeat(n, str) {
    var res = [];
    var i;
    for (i = 0; i < n; ++i) {
      res.push(str);
    }
    return res.join('');
  }

  this._writeFailures = function(browser) {

    var specFailures = this._failures[browser.name];
    var specHierarchy = {};
    var report = [];

    if (!specFailures) {
      return '';
    }

    specFailures.forEach(function(failure) {

      var result = failure.result;
      var fullSpecPath = [].concat(failure.browser.name, result.suite, result.description);
      var maxDepth = fullSpecPath.length - 1;

      fullSpecPath.reduce(function(suite, describe, depth) {

        var isFirst = depth === 0;
        var isLast = depth === maxDepth;
        var levelExists = describe in suite;
        var message = describe;

        if (!levelExists) {
          suite[describe] = {};

          if (isFirst) {
            message = describe;
          } else if (isLast) {
            message = (repeat(depth, '  ') + '✘ ' + describe.underline);
          } else {
            message = (repeat(depth, '  ') + 'ட ' + describe);
          }

          report.push(message + '\n');
        }

        return suite[describe];

      }, specHierarchy);

    });

    delete this._failures[browser.name];
    report = '\n' + report.join('').red;
    return report;

  };


  this.specFailure = function(browser, result) {
    this._failures = this._failures || {};
    this._failures[browser.name] = this._failures[browser.name] || [];
    this._failures[browser.name].push({
      browser: browser,
      result: result
    });
  };


  this.onRunComplete = function(browsers, results) {
    if (browsers.length > 1 && !results.error && !results.disconnected) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success);
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success);
      }
    }
  };

  this.USE_COLORS = false;

  this.LOG_SINGLE_BROWSER = 'LOG: %s\n';
  this.LOG_MULTI_BROWSER = '%s LOG: %s\n';

  this.SPEC_FAILURE = '%s %s FAILED' + '\n';
  this.SPEC_SLOW = '%s SLOW %s: %s\n';
  this.ERROR = '%s ERROR\n';

  this.FINISHED_ERROR = ' ERROR';
  this.FINISHED_SUCCESS = ' SUCCESS';
  this.FINISHED_DISCONNECTED = ' DISCONNECTED';

  this.X_FAILED = ' (%d FAILED)';

  this.TOTAL_SUCCESS = 'TOTAL: %d SUCCESS\n';
  this.TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS\n';
};

BaseReporter.decoratorFactory = function(formatError, reportSlow) {
  return function(self) {
    BaseReporter.call(self, formatError, reportSlow);
  };
};

BaseReporter.decoratorFactory.$inject = ['formatError', 'config.reportSlowerThan'];


// PUBLISH
module.exports = BaseReporter;
