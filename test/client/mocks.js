/**
 Mocks for testing static/testacular.js
 Needs to be loaded before testacular.js
 */

var Emitter = function() {
  var listeners = {};

  this.on = function(event, fn) {
    if (!listeners[event]) {
      listeners[event] = [];
    }

    listeners[event].push(fn);
  };

  this.emit = function(event) {
    var eventListeners = listeners[event];

    if (!eventListeners) return;

    var i = 0;
    while (i < eventListeners.length) {
      eventListeners[i].apply(null, Array.prototype.slice.call(arguments, 1));
      i++;
    }
  };
};

var MockSocket = Emitter;

var io = {
  connect: function() {
    return new MockSocket();
  }
};
