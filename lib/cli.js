var optimist = require('optimist');
var util = require('./util');
var constant = require('./constants');

var sharedConfig = function() {
  optimist
    .describe('port-runner', 'Port where the server is listening for runner.')
    .describe('help', 'Print usage.')
    .describe('version', 'Print current version.');
};


var processOptions = function(argv) {
  argv = optimist.parse(argv || process.argv);

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  if (argv.version) {
    console.log('Testacular version: ' + constant.VERSION);
    process.exit(0);
  }

  // TODO(vojta): warn/throw when unknown argument (probably mispelled)
  var options = {};
  Object.getOwnPropertyNames(argv).forEach(function(name) {
    if (name === '_' || name === '$0') return;
    options[util.dashToCamel(name)] = argv[name];
  });

  if (util.isString(options.autoWatch)) {
    options.autoWatch = options.autoWatch === 'true';
  }

  options.configFile = argv._[2] || 'testacular.conf';

  return options;
}


exports.runner = function() {
  optimist.usage('Execute - send execute command to Testacular server.\nUsage: $0 [options]');
  sharedConfig();

  return processOptions();
};


exports.server = function(argv) {
  optimist
    .usage('Start Testacular server.\nUsage: $0 [configFile] [options]')
    .describe('port', 'Port where the web server is running.')
    .describe('auto-watch', 'Auto watch source files and run on change ?')
    .describe('auto-watch-interval', 'Interval for OS that do polling, in ms.');

  sharedConfig();

  return processOptions(argv);
};
