/* global io */
/* eslint-disable no-new */

require('core-js/es5')
var Karma = require('./karma')
var StatusUpdater = require('./updater')
var util = require('./util')

var KARMA_URL_ROOT = require('./constants').KARMA_URL_ROOT

// Connect to the server using socket.io http://socket.io
var socket = io(location.host, {
  reconnectionDelay: 500,
  reconnectionDelayMax: Infinity,
  timeout: 2000,
  path: '/' + KARMA_URL_ROOT.substr(1) + 'socket.io',
  'sync disconnect on unload': true
})

// instantiate the updater of the view
new StatusUpdater(socket, util.elm('title'), util.elm('banner'), util.elm('browsers'))
window.karma = new Karma(socket, util.elm('context'), window.open,
  window.navigator, window.location)
