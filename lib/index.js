'use strict'

const constants = require('./constants')
const Server = require('./server')
const runner = require('./runner')
const stopper = require('./stopper')
const launcher = require('./launcher')
const cfg = require('./config')

// TODO: remove in 1.0
const oldServer = {
  start: function (cliOptions, done) {
    console.error('WARN `start` method is deprecated since 0.13. It will be removed in 0.14. Please use \n' +
      '  server = new Server(config, [done])\n' +
      '  server.start()\n' +
      'instead.')
    const server = new Server(cliOptions, done)
    server.start()
  }
}

module.exports = {
  constants: constants,
  VERSION: constants.VERSION,
  Server: Server,
  runner: runner,
  stopper: stopper,
  launcher: launcher,
  config: { parseConfig: cfg.parseConfig }, // lets start with only opening up the `parseConfig` api
  server: oldServer
}
