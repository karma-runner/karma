var util = require('util');
var u = require('./util');
var builder = require('xmlbuilder');
var fs = require('fs');
var os = require("os");
var log = require('./logger').create('reporter');
var path = require('path');


var createErrorFormatter = function(basePath, urlRoot) {
  var URL_REGEXP = new RegExp('http:\\/\\/[^\\/]*' + urlRoot.replace(/\//g, '\\/') +
                              '(base|absolute)([^\\?\\s]*)(\\?[0-9]*)?', 'g');

  return function(msg, indentation) {
    // remove domain and timestamp from source files
    // and resolve base path / absolute path urls into absolute path
    msg = msg.replace(URL_REGEXP, function(full, prefix, path) {
      if (prefix === 'base') {
        return basePath + path;
      } else if (prefix === 'absolute') {
        return path;
      }
    });

    // indent every line
    if (indentation) {
      msg = indentation + msg.replace(/\n/g, '\n' + indentation);
    }

    return msg + '\n';
  };
};


// TODO(vojta): split this into reporters/*.js
var BaseReporter = function(formatError, reportSlow, adapter) {
  this.adapters = [adapter || process.stdout.write.bind(process.stdout)];


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

      msg += util.format(' (%s / %s)', u.formatTimeInterval(results.totalTime),
                                       u.formatTimeInterval(results.netTime));
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
    if (result.skipped) {
      this.specSkipped(browser, result);
    } else if (result.success) {
      this.specSuccess(browser, result);
    } else {
      this.specFailure(browser, result);
    }

    if (reportSlow && result.time > reportSlow) {
      var specName = result.suite.join(' ') + ' ' + result.description;
      var time = u.formatTimeInterval(result.time);

      this.writeCommonMsg(util.format(this.SPEC_SLOW, browser, time, specName));
    }
  };


  this.specSuccess = this.specSkipped = function() {};


  this.specFailure = function(browser, result) {
    var specName = result.suite.join(' ') + ' ' + result.description;
    var msg = util.format(this.SPEC_FAILURE, browser, specName);

    result.log.forEach(function(log) {
      msg += formatError(log, '\t');
    });

    this.writeCommonMsg(msg);
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


var BaseColorReporter = function() {
  this.SPEC_FAILURE = '\x1B[31m%s %s FAILED\x1B[39m' + '\n';
  this.SPEC_SLOW = '\x1B[33m%s SLOW %s:\x1B[39m %s\n';
  this.ERROR = '\x1B[31m%s ERROR\x1B[39m\n';

  this.FINISHED_ERROR = ' \x1B[31mERROR\x1B[39m';
  this.FINISHED_SUCCESS = ' \x1B[32mSUCCESS\x1B[39m';
  this.FINISHED_DISCONNECTED = ' \x1B[31mDISCONNECTED\x1B[39m';

  this.X_FAILED = ' \x1B[31m(%d FAILED)\x1B[39m';

  this.TOTAL_SUCCESS = '\x1B[32mTOTAL: %d SUCCESS\x1B[39m\n';
  this.TOTAL_FAILED = '\x1B[31mTOTAL: %d FAILED, %d SUCCESS\x1B[39m\n';
};


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


var DotsColorReporter = function(formatError, reportSlow) {
  DotsReporter.call(this, formatError, reportSlow);
  BaseColorReporter.call(this);
};


var ProgressColorReporter = function(formatError, reportSlow) {
  ProgressReporter.call(this, formatError, reportSlow);
  BaseColorReporter.call(this);
};


var JUnitReporter = function(formatError, outputFile, pkgName) {
  var xml;
  var suites;

  this.adapters = [];

  this.onRunStart = function(browsers) {
    suites = {};
    xml = builder.create('testsuites');

    var suite;
    var timestamp = (new Date()).toISOString().substr(0, 19);
    browsers.forEach(function(browser) {
      suite = suites[browser.id] = xml.ele('testsuite', {
        name: browser.name, 'package': pkgName, timestamp: timestamp, id: 0, hostname: os.hostname()
      });
      suite.ele('properties').ele('property', {name: 'browser.fullName', value: browser.fullName});
    });
  };

  this.onBrowserComplete = function(browser) {
    var suite = suites[browser.id];
    var result = browser.lastResult;

    suite.att('tests', result.total);
    suite.att('errors', result.disconnected || result.error ? 1 : 0);
    suite.att('failures', result.failed);
    suite.att('time', result.netTime / 1000);

    suite.ele('system-out');
    suite.ele('system-err');
  };

  this.onRunComplete = function() {
    u.mkdirIfNotExists(path.dirname(outputFile), function() {
      fs.writeFile(outputFile, xml.end({pretty: true}), function(err) {
        if (err) {
          log.warn('Cannot write JUnit xml\n\t' + err.message);
        } else {
          log.debug('JUnit results written to "%s".', outputFile);
        }
      });

      suites = xml = null;
    });
  };

  this.onSpecComplete = function(browser, result) {
    var spec = suites[browser.id].ele('testcase', {
      name: result.description, time: result.time / 1000,
      classname: (pkgName ? pkgName + ' ' : '') + browser.name + '.' + result.suite.join(' ').replace(/\./g, '_')
    });

    if (!result.success) {
      result.log.forEach(function(err) {
        spec.ele('failure', {type: ''}, formatError(err));
      });
    }
  };
};


var MultiReporter = function() {
  var reporters = this.reporters = [];

  this.addAdapter = function(adapter) {
    reporters.forEach(function(reporter) {
      reporter.adapters.push(adapter);
    });
  };

  this.removeAdapter = function(adapter) {
    reporters.forEach(function(reporter) {
      u.arrayRemove(reporter.adapters, adapter);
    });
  };
};


// PUBLISH
exports.Dots = DotsReporter;
exports.Progress = ProgressReporter;
exports.DotsColor = DotsColorReporter;
exports.ProgressColor = ProgressColorReporter;
exports.JUnit = JUnitReporter;


exports.createReporters = function(names, config) {
  var errorFormatter = createErrorFormatter(config.basePath, config.urlRoot);
  var multiReporter = new MultiReporter();

  names.forEach(function(name) {
    if (name === 'junit') {
      return multiReporter.reporters.push(new JUnitReporter(errorFormatter,
          config.junitReporter.outputFile, config.junitReporter.suite));
    }

    var Reporter = exports[u.ucFirst(name) + (config.colors ? 'Color' : '')];
    if (Reporter) {
      return multiReporter.reporters.push(new Reporter(errorFormatter, config.reportSlowerThan));
    }

    log.error('Reporter "%s" does not exist!', name);
  });

  return multiReporter;
};
