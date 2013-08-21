/**
 Mocks for testing static/karma.js
 Needs to be loaded before karma.js
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


var MockSocket = function() {
  Emitter.call(this);

  this.socket = {transport: {name: 'websocket'}};

  // MOCK API
  this._setTransportNameTo = function(transportName) {
    this.socket.transport.name = transportName;
  };
};


var io = {
  connect: function() {
    return new MockSocket();
  }
};
