var BaseReporter = require('./Base');
var util = require('util');

var TeamcityReporter = function(formatError, reportSlow) {
  BaseReporter.call(this, formatError, reportSlow);

  this.onRunStart = function(browsers) {
    this.browsers_ = browsers;
    this.browserResults = {
    }; 
  };

  this.writeCommonMsg = function(msg) {
    this.write('\n' + msg);
    this.dotsCount_ = 0;
  };

  this.specSuccess = function(browser, result) {
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result.suite);
    browseResult.log.push(util.format(this.TEST_START, escTCString(testName)));
    browseResult.log.push(util.format(this.TEST_END, escTCString(testName), result.time));
  };

  this.specFailure = function(browser, result){
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result.suite);
    browseResult.log.push(util.format(this.TEST_START, escTCString(testName)));
    browseResult.log.push(util.format(this.TEST_FAILED, escTCString(testName), escTCString(JSON.stringify(result.log))));
    browseResult.log.push(util.format(this.TEST_END, escTCString(testName), result.time));
  }
  
  this.specSkipped = function(browser, result){
    var browseResult = this.checkNewSuit(browser, result);
    var testName = getTestName(result.suite);
    browseResult.log.push(util.format(this.TEST_IGNORED, escTCString(testName)));
  }

  this.checkNewSuit = function(browser, result){
    var browserResult = this.checkNewBrowser(browser);
    if(!suiteExists()){
      if(browserResult.suits.length > 0){
        browserResult.log.push(util.format(this.SUITE_END, escTCString(browserResult.suits[browserResult.suits.length - 1])));
      }
      browserResult.suits.push(result.suite[0]);
      browserResult.log.push(util.format(this.SUITE_START, escTCString(result.suite[0])));
    }
    return browserResult;
    function suiteExists(){
      return browserResult.suits.indexOf(result.suite[0]) !== -1;
    }
  }

  function getTestName(result){
    return result.slice(1).join(" ");
  }
  
  this.checkNewBrowser = function(browser){
    if(!this.browserResults[browser.name]){
      this.browserResults[browser.name] = {
        log : [],
        suits : []
      }
    }
    return this.browserResults[browser.name];
  }

  this.onRunComplete = function(browsers, results) {
    var that = this;
    Object.keys(this.browserResults).forEach(function(key){
      that.write(that.BROWSER_START, key);
      that.write(that.browserResults[key].log.join("\n"));
      that.write(that.BROWSER_END, key);
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
  this.TEST_IGNORED = "##teamcity[testIgnored name='%s']"
  this.SUITE_START = "##teamcity[testSuiteStarted name='%s']";
  this.SUITE_END = "##teamcity[testSuiteFinished name='%s']";
  this.TEST_START = "##teamcity[testStarted name='%s']";
  this.TEST_FAILED = "##teamcity[testFailed name='%s' message='FAILED' details='%s']";
  this.TEST_END = "##teamcity[testFinished name='%s' duration='%s']";
  this.BROWSER_START = "##teamcity[browserStart name='%s']\n";
  this.BROWSER_END = "\n##teamcity[browserEnd name='%s']";
}
function escTCString (message) {
    if(!message) {
	return "";
    }

    return message.replace(/\|/g, "||")
		  .replace(/\'/g, "|'")
		  .replace(/\n/g, "|n")
		  .replace(/\r/g, "|r")
		  .replace(/\u0085/g, "|x")
		  .replace(/\u2028/g, "|l")
		  .replace(/\u2029/g, "|p")
		  .replace(/\[/g, "|[")
		  .replace(/]/g, "|]");
}

module.exports = TeamcityReporter;
