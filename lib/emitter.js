var events = require('events');
var util = require('util');
var u = require('./util');

var EventEmitter = function() {
  this.bind = function(obj) {
    for (var method in obj) {
      if (u.isFunction(obj[method]) && method.substr(0, 2) === 'on') {
        this.on(u.camelToUnderscore(method.substr(2)), obj[method].bind(obj));
      }
    }
  };
};

util.inherits(EventEmitter, events.EventEmitter);

// PUBLISH
exports.EventEmitter = EventEmitter;
