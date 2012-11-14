var util = require('util');
var growly = require('growly');
var path = require('path');

var helper = require('../util');

var MSG_SUCCESS = '%s SUCCESS\n%d tests passed in %s.';
var MSG_FAILURE = '%s FAILURE\n%d/%d tests failed in %s.';
var MSG_ERROR = '%s ERROR';
var NO_RUN_ERROR  = 'Execution aborted.';

var GrowlReporter = function() {
    var growlOptions = {
      success: {
        dispname: 'Success',
        title: 'Specs passed.',
        icon: path.join(__dirname, 'images/success.png')
      },
      failed: {
        dispname: 'Failed',
        title: 'Specs failed.',
        icon: path.join(__dirname, 'images/failed.png')
      },
      error: {
        dispname: 'Aborted',
        title: 'Error occured.',
        icon: path.join(__dirname, 'images/error.png')
      }
    };

    growly.register('Testacular', '');

  this.onBrowserComplete = function(browser) {
    var results = browser.lastResult;
    var time = helper.formatTimeInterval(results.totalTime);

    if (results.disconnected || results.error) {
      return growly.notify(util.format(MSG_ERROR, browser.name), growlOptions.error);
    }

    if (results.failed) {
      return growly.notify(util.format(MSG_FAILURE, browser.name, results.failed, results.total, time), growlOptions.failed);
    }

    growly.notify(util.format(MSG_SUCCESS, browser.name, results.success, time), growlOptions.success);
  };

};
// PUBLISH
module.exports = GrowlReporter;
