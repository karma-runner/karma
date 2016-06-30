/* global io */
/* eslint-disable no-new */

require('core-js/es5')
var Karma = require('./karma')
var StatusUpdater = require('./updater')
var util = require('../common/util')

var KARMA_SOCKET_RELATIVE_URL = require('./constants').KARMA_SOCKET_RELATIVE_URL

// Construct the absolute path to the socket as socket.io
// doesn't like relative paths.
// Also we constructed the socket.io path
// so we know it will only contain .. sequences followed by a path
var baseParts = location.pathname.split('/')
var relativeParts = KARMA_SOCKET_RELATIVE_URL.split('/')
// remove current file name (or empty string)
// assumes that directory urls will always have a trailing slash
baseParts.pop()
while (relativeParts.length > 0) {
  var part = relativeParts.pop()
  if (part === '..') baseParts.pop()
  else baseParts.push(part)
}
var absoluteSocketUrl = baseParts.join('/')

// Connect to the server using socket.io http://socket.io
var socket = io(location.host, {
  reconnectionDelay: 500,
  reconnectionDelayMax: Infinity,
  timeout: 2000,
  path: absoluteSocketUrl,
  'sync disconnect on unload': true
})

// instantiate the updater of the view
new StatusUpdater(socket, util.elm('title'), util.elm('banner'), util.elm('browsers'))
window.karma = new Karma(socket, util.elm('context'), window.open,
  window.navigator, window.location)
