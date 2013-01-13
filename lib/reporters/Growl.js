var util = require('util');
var growly = require('growly');
var path = require('path');

var helper = require('../helper');
var log = require('../logger').create('reporter');

var MSG_SUCCESS = '%d tests passed in %s.';
var MSG_FAILURE = '%d/%d tests failed in %s.';
var MSG_ERROR = '';

var OPTIONS = {
  success: {
    dispname: 'Success',
    title: 'PASSED - %s',
    icon: path.join(__dirname, 'images/success.png')
  },
  failed: {
    dispname: 'Failure',
    title: 'FAILED - %s',
    icon: path.join(__dirname, 'images/failed.png')
  },
  error: {
    dispname: 'Aborted',
    title: 'ERROR - %s',
    icon: path.join(__dirname, 'images/error.png')
  }
};

var optionsFor = function(type, browser) {
  return helper.merge(OPTIONS[type], {title: util.format(OPTIONS[type].title, browser)});
};


var GrowlReporter = function() {
  growly.register('Testacular', '', [], function(error) {
    var warning = 'No running verion of GNTP found.\n' +
                  'For more information see https://github.com/theabraham/growly.';
    if (error) {
      log.warn(warning);
    }
  });

  this.adapters = [];

  this.onBrowserComplete = function(browser) {
    var results = browser.lastResult;
    var time = helper.formatTimeInterval(results.totalTime);

    if (results.disconnected || results.error) {
      return growly.notify(MSG_ERROR, optionsFor('error', browser.name));
    }

    if (results.failed) {
      return growly.notify(util.format(MSG_FAILURE, results.failed, results.total, time),
          optionsFor('failed', browser.name));
    }

    growly.notify(util.format(MSG_SUCCESS, results.success, time), optionsFor('success',
        browser.name));
  };
};


// PUBLISH
module.exports = GrowlReporter;
