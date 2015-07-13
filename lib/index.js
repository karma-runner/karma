// index module

var constants = require('./constants')
var Server = require('./server')
var runner = require('./runner')
var launcher = require('./launcher')

// TODO: remove in 1.0
var oldServer = {
  start: function () {
    throw new Error(
      'The api interface has changed. Please use \n' +
      '  server = new Server(config, [done])\n' +
      '  server.start()\n' +
      'instead.'
    )
  }
}

module.exports = {
  VERSION: constants.VERSION,
  Server: Server,
  runner: runner,
  launcher: launcher,
  server: oldServer
}
