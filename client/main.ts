/* global io */
/* eslint-disable no-new */

import {KARMA_PROXY_PATH, KARMA_URL_ROOT} from './constants';
require('core-js/es5')
import {Karma} from './karma'
import {StatusUpdater} from './updater'
import * as util from '../common/util'
// import constants = require('./constants')
import * as io from 'socket.io-client'


// Connect to the server using socket.io http://socket.io
var socket = io(location.host, {
  reconnectionDelay: 500,
  reconnectionDelayMax: Infinity,
  timeout: 2000,
  path: KARMA_PROXY_PATH + KARMA_URL_ROOT.substr(1) + 'socket.io',
  // 'sync disconnect on unload': true
})

// instantiate the updater of the view
new StatusUpdater(socket, util.elm('title'), util.elm('banner'), util.elm('browsers'));
(<any>window).karma = new Karma(socket, util.elm('context'), window.open,
  window.navigator, window.location)
