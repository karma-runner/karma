var events = require('events');
var util = require('util');
var Q = require('q');

var helper = require('./helper');


var bindAllEvents = function(object, context) {
  context = context || this;

  for (var method in object) {
    if (helper.isFunction(object[method]) && method.substr(0, 2) === 'on') {
      context.on(helper.camelToSnake(method.substr(2)), object[method].bind(object));
    }
  }
};

var EventEmitter = function() {
  this.bind = bindAllEvents;

  this.emitAsync = function(name) {
    // TODO(vojta): allow passing args
    // TODO(vojta): ignore/throw if listener call done() multiple times
    var pending = this.listeners(name).length;
    var deferred = Q.defer();
    var done = function() {
      if (!--pending) {
        deferred.resolve();
      }
    };

    this.emit(name, done);

    return deferred.promise;
  };
};

util.inherits(EventEmitter, events.EventEmitter);

// PUBLISH
exports.EventEmitter = EventEmitter;
exports.bindAll = bindAllEvents;
