var util = require('./util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./logger');

var Browser = function(id, collection, emitter) {
  var log = logger.create(id);

  this.id = id;
  this.name = id;
  this.fullName = null;
  this.isReady = true;
  this.lastResult = {
    success: 0,
    failed: 0,
    total: 0
  };

  this.toString = function() {
    return this.name;
  };

  this.onName = function(fullName) {
    this.fullName = fullName;
    this.name = util.browserFullNameToShort(fullName);
    log = logger.create(this.name);
    log.info('Connected on socket id ' + this.id);
    emitter.emit('browsers_change', collection);
  };

  this.onError = function(error) {
    emitter.emit('browser_error', this, error);
  };

  this.onInfo = function(info) {
    if (util.isDefined(info.dump)) {
      emitter.emit('browser_dump', this, info.dump);
    }

    if (util.isDefined(info.total)) {
      this.lastResult.total = info.total;
    }
  };

  this.onComplete = function() {
    this.isReady = true;
    emitter.emit('browsers_change', this);
    emitter.emit('browser_complete', this);
  };

  this.onDisconnect = function() {
    if (!this.isReady) {
      this.isReady = true;
      this.lastResult.disconnected = true;
      emitter.emit('browser_complete', this);
    }

    log.warn('Diconnected');
    collection.remove(this);
  };

  this.onResult = function(result) {
    // ignore - probably results from last run (after server disconnecting)
    if (this.isReady) return;

    if (result.success) this.lastResult.success++
    else this.lastResult.failed++;

    emitter.emit('spec_complete', this, result);
  };

  this.serialize = function() {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady
    };
  };
};

var Collection = function(emitter) {
  var browsers = [];

  this.__defineGetter__('length', function() {
    return browsers.length;
  });

  this.add = function(browser) {
    browsers.push(browser);
    emitter.emit('browsers_change', this);
  };

  this.remove = function(browser) {
    var index = browsers.indexOf(browser);

    if (index === -1) return false;

    browsers.splice(index, 1);
    emitter.emit('browsers_change', this);

    return true;
  };

  this.setAllIsReadyTo = function(value) {
    var change = false;
    browsers.forEach(function(browser) {
      change = change || browser.isReady !== value;
      browser.isReady = value;
    });

    if (change) {
      emitter.emit('browsers_change', this);
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


exports.Browser = Browser;
exports.Collection = Collection;

exports.createBrowser = function(socket, collection, emitter) {
  var browser = new Browser(socket.id, collection, emitter);

  // TODO(vojta): reuse emitter.EventEmitter.bind method (put into utils ?)
  ['Result', 'Complete', 'Error', 'Info', 'Name', 'Disconnect'].forEach(function(event) {
    socket.on(event.toLowerCase(), browser['on' + event].bind(browser));
  });

  collection.add(browser);
  return browser;
};
