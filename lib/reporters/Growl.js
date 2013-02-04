var util = require('util');
var growl = require('growl');
var path = require('path');

var helper = require('../helper');
var log = require('../logger').create('reporter');

var MSG_SUCCESS = '%d tests passed in %s.';
var MSG_FAILURE = '%d/%d tests failed in %s.';
var MSG_ERROR = '';

var GrowlReporter = function() {
  this.adapters = [];

  this.onBrowserComplete = function(browser) {
    var results = browser.lastResult;
    var time = helper.formatTimeInterval(results.totalTime);

    if (results.disconnected || results.error) {
      return growl(MSG_ERROR, {
        title: 'Testacular - Error',
        image: path.join(__dirname, 'images/error.png')
      });
    }

    if (results.failed) {
      return growl(util.format(MSG_FAILURE, results.failed, results.total, time), {
        title: 'Testacular - Fail',
        image: path.join(__dirname, 'images/failed.png')
      });
    }

    growl(util.format(MSG_SUCCESS, results.success, time), {
      title: 'Testacular - Pass',
      image: path.join(__dirname, 'images/success.png')
    });
  };
};


// PUBLISH
module.exports = GrowlReporter;
