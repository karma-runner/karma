'use strict'

const constants = require('./constants')
const Server = require('./server')
const runner = require('./runner')
const stopper = require('./stopper')
const launcher = require('./launcher')
const cfg = require('./config')

module.exports = {
  constants: constants,
  VERSION: constants.VERSION,
  Server: Server,
  runner: runner,
  stopper: stopper,
  launcher: launcher,
  config: { parseConfig: cfg.parseConfig } // lets start with only opening up the `parseConfig` api
}
