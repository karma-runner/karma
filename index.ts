// index module

import {ConfigOptions} from './lib/config-options'
export {VERSION} from './lib/constants'
import {Server} from './lib/server';
export {Server} from './lib/server';
export {run as runner} from './lib/runner';
export {stop as stopper} from './lib/stopper';
export {Launcher as launcher} from './lib/launcher';

// TODO: remove in 1.0
var oldServer = {
  start: function (cliOptions: ConfigOptions, done) {
    console.error('WARN `start` method is deprecated since 0.13. It will be removed in 0.14. Please use \n' +
      '  server = new Server(config, [done])\n' +
      '  server.start()\n' +
      'instead.')
    var server = new Server(cliOptions, done)
    server.start()
  }
}

export var server = oldServer;
