// index module
import * as constants from './constants';
import Server from './server';
import runner from './runner';
import stopper from './stopper';
import launcher from './launcher';
import cfg from './config';

// TODO: remove in 1.0
var oldServer = {
  start: function (cliOptions, done) {
    console.error('WARN `start` method is deprecated since 0.13. It will be removed in 0.14. Please use \n' +
      '  server = new Server(config, [done])\n' +
      '  server.start()\n' +
      'instead.')
    var server = new Server(cliOptions, done)
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
