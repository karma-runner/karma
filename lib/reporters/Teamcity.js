var BaseReporter = require('./Base');
var util = require('util');

var escTCString = function (message) {
  if(!message) {
    return '';
  }

  return message.
      replace(/\|/g, '||').
      replace(/\'/g, '|\'').
      replace(/\n/g, '|n').
      replace(/\r/g, '|r').
      replace(/\u0085/g, '|x').
      replace(/\u2028/g, '|l').
      replace(/\u2029/g, '|p').
      replace(/\[/g, '|[').
      replace(/\]/g, '|]');
};

var getTestName = function (result) {
  return result.description;
};

var getSuiteName = function(result) {
  return result.suite.join(' ');
};


var TeamcityReporter = function(formatError, reportSlow) {
  BaseReporter.call(this, formatError, reportSlow);

  this.onRunStart = function(browsers) {
    this._browsers = browsers;
    this.browserResults = {};
  };

  this.writeCommonMsg = function(msg) {
    this.write('\n' + msg);
    this._dotsCount = 0;
  };

  this.specSuccess = function(browser, result) {
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result);

    browseResult.log.push(util.format(this.TEST_START, escTCString(testName)));
    browseResult.log.push(util.format(this.TEST_END,
      escTCString(testName), result.time));
  };

  this.specFailure = function(browser, result) {
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result);

    browseResult.log.push(util.format(this.TEST_START, escTCString(testName)));
    browseResult.log.push(util.format(this.TEST_FAILED, escTCString(testName),
      escTCString(JSON.stringify(result.log))));
    browseResult.log.push(util.format(this.TEST_END,
      escTCString(testName), result.time));
  };

  this.specSkipped = function(browser, result) {
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result);

    browseResult.log.push(util.format(this.TEST_IGNORED, escTCString(testName)));
  };

  this.checkNewSuit = function(browser, result) {
    var browserResult = this.checkNewBrowser(browser);
    var suiteName = getSuiteName(result);
    var suiteExists = browserResult.suits.indexOf(suiteName) !== -1;

    if(!suiteExists) {
      if(browserResult.suits.length > 0) {
        browserResult.log.push(util.format(this.SUITE_END,
          escTCString(browserResult.suits[browserResult.suits.length - 1])));
      }
      browserResult.suits.push(suiteName);
      browserResult.log.push(util.format(this.SUITE_START, escTCString(suiteName)));
    }
    return browserResult;
  };

  this.checkNewBrowser = function(browser) {
    if(!this.browserResults[browser.id]) {
      this.browserResults[browser.id] = {
        name: browser.name,
        log : [],
        suits : []
      };
    }
    return this.browserResults[browser.id];
  };

  this.onRunComplete = function(browsers, results) {
    var self = this;

    Object.keys(this.browserResults).forEach(function(browserId) {
      var browserResult = self.browserResults[browserId];
      if(browserResult.suits.length > 0) {
        browserResult.log.push(util.format(self.SUITE_END,
          escTCString(browserResult.suits[browserResult.suits.length - 1])));
      }
      self.write(self.BROWSER_START, browserResult.name);
      self.write(browserResult.log.join('\n'));
      self.write(self.BROWSER_END, browserResult.name);
    });

    this.writeCommonMsg(browsers.map(this.renderBrowser).join('\n') + '\n');

    if (browsers.length > 1 && !results.disconnected && !results.error) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success);
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success);
      }
    }
  };

  this.TEST_IGNORED = '##teamcity[testIgnored name=\'%s\']';
  this.SUITE_START = '##teamcity[testSuiteStarted name=\'%s\']';
  this.SUITE_END = '##teamcity[testSuiteFinished name=\'%s\']';
  this.TEST_START = '##teamcity[testStarted name=\'%s\']';
  this.TEST_FAILED = '##teamcity[testFailed name=\'%s\' message=\'FAILED\' details=\'%s\']';
  this.TEST_END = '##teamcity[testFinished name=\'%s\' duration=\'%s\']';
  this.BROWSER_START = '##teamcity[browserStart name=\'%s\']\n';
  this.BROWSER_END = '\n##teamcity[browserEnd name=\'%s\']';
};

module.exports = TeamcityReporter;
