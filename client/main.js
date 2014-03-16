var Karma = require('./karma');
var StatusUpdater = require('./updater');
var util = require('./util');

var KARMA_URL_ROOT = require('./constants').KARMA_URL_ROOT;


// connect socket.io
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
var socket = io.connect('http://' + location.host, {
  'reconnection delay': 500,
  'reconnection limit': 2000,
  'resource': KARMA_URL_ROOT.substr(1) + 'socket.io',
  'sync disconnect on unload': true,
  'max reconnection attempts': Infinity
});

// instantiate the updater of the view
new StatusUpdater(socket, util.elm('title'), util.elm('banner'), util.elm('browsers'));
window.karma = new Karma(socket, util.elm('context'), window.open,
	window.navigator, window.location);
