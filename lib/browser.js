var util = require('./util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./logger');

var Browser = function(id, collection) {
  var log = logger.create(id);

  this.id = id;
  this.name = id;
  this.fullName = null;
  this.isReady = true;
  this.lastResult = {
    success: 0,
    failed: 0
  };

  this.toString = function() {
    return this.name;
  };

  this.onName = function(fullName) {
    this.fullName = fullName;
    this.name = util.browserFullNameToShort(fullName);
    log = logger.create(this.name);
    log.info('Connected on socket id ' + this.id);
    collection.emit('change');
  };

  this.onError = function(error) {
    log.error(util.formatError(error, '\t'));
  };

  this.onInfo = function(info) {
    log.info(info);
  };

  this.onComplete = function() {
    log.error('FAILED: %d PASSED: %d', this.lastResult.failed, this.lastResult.success);
    this.isReady = true;
    collection.emit('change');
  };

  this.onDisconnect = function() {
    log.warn('Diconnected')
    collection.remove(this);
  };

  this.onResult = function(result) {
    //                    browser name       info/error                     passed/failed
    var LINE_LENGTH = 140 - this.name.length - (result.success ? 9 : 10)   - 6;
    var PASSED = '\033[32mPASSED\033[39m';
    var FAILED = '\033[31mFAILED\033[39m';

    var msg = result.suite.join('.') + ' ' + result.description;
    msg = msg.substr(0, LINE_LENGTH);

    msg += new Array(LINE_LENGTH - msg.length + 1).join('.');
    msg += result.success ? PASSED : FAILED;

    if (result.success) {
      log.info(msg);
      this.lastResult.success++;
    } else  {
      log.error(msg);
      this.lastResult.failed++;
      result.log.forEach(function(log) {
        console.log(util.formatError(log, '\t') + '\n');
      });
    }
  };

  this.serialize = function() {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady
    };
  };
};

var Collection = function() {
  var browsers = [];

  this.__defineGetter__('length', function() {
    return browsers.length;
  });

  this.add = function(browser) {
    browsers.push(browser);
    this.emit('change');
  };

  this.remove = function(browser) {
    var index = browsers.indexOf(browser);

    if (index === -1) return false;

    browsers.splice(index, 1);
    this.emit('change');

    return true;
  };

  this.setAllIsReadyTo = function(value) {
    var change = false;
    browsers.forEach(function(browser) {
      change = change || browser.isReady !== value;
      browser.isReady = value;
    });

    if (change) {
      this.emit('change');
    }
  };

  this.areAllReady = function(nonReadyList) {
    var allReady = true;
    browsers.forEach(function(browser) {
      if (!browser.isReady) {
        nonReadyList && nonReadyList.push(browser);
        allReady = false;
      }
    });

    return allReady;
  };

  this.serialize = function() {
    return browsers.map(function(browser) {
      return browser.serialize();
    });
  };

  this.getResults = function() {
    return browsers.reduce(function(previous, current) {
      previous.success += current.lastResult.success;
      previous.failed += current.lastResult.failed;
      return previous;
    }, {success: 0, failed: 0});
  };

  this.clearResults = function() {
    browsers.forEach(function(browser) {
      browser.lastResult = {success: 0, failed: 0};
    });
  };
};

Collection.prototype = new EventEmitter();

exports.Browser = Browser;
exports.Collection = Collection;

exports.createBrowser = function(socket, collection) {
  var browser = new Browser(socket.id, collection);

  ['Result', 'Complete', 'Error', 'Info', 'Name', 'Disconnect'].forEach(function(event) {
    socket.on(event.toLowerCase(), browser['on' + event].bind(browser));
  });

  collection.add(browser);
  return browser;
};
