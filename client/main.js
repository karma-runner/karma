/* global io */
/* eslint-disable no-new */

var Karma = require('./karma')
var StatusUpdater = require('./updater')
var util = require('../common/util')
var constants = require('./constants')

var KARMA_URL_ROOT = constants.KARMA_URL_ROOT
var KARMA_PROXY_PATH = constants.KARMA_PROXY_PATH
var BROWSER_SOCKET_TIMEOUT = constants.BROWSER_SOCKET_TIMEOUT

// Connect to the server using socket.io https://socket.io/
var socket = io(location.host, {
  // We can't support reconnection without message replay: any messages sent
  // after disconnect are lost.
  reconnection: false,
  // At this timeout the client disconnects and the server sees 'transport close'
  timeout: BROWSER_SOCKET_TIMEOUT,
  path: KARMA_PROXY_PATH + KARMA_URL_ROOT.slice(1) + 'socket.io',
  'sync disconnect on unload': true,
  useNativeTimers: true
})

// instantiate the updater of the view
var updater = new StatusUpdater(socket, util.elm('title'), util.elm('banner'), util.elm('browsers'))
window.karma = new Karma(updater, socket, util.elm('context'), window.open,
  window.navigator, window.location, window.document)
