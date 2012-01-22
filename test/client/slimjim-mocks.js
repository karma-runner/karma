/**
 Mocks for testing static/slimjim.js
 Needs to be loaded before slimjim.js
 */

var MockSocket = function() {
  var listeners = {};

  this.on = function(event, fn) {
    if (!listeners[event]) {
      listeners[event] = [];
    }

    listeners[event].push(fn);
  };

  this.emit = function(event, arg) {
    var eventListeners = listeners[event];

    if (!eventListeners) return;

    var i = 0;
    while (i < eventListeners.length) {
      eventListeners[i](arg);
      i++;
    }
  };
};

var io = {
  connect: function() {
    return new MockSocket();
  }
};
