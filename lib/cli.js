var optimist = require('optimist');
var util = require('./util');
var constant = require('./constants');

var sharedConfig = function() {
  optimist
    .describe('port-runner', '<integer> Port where the server is listening for runner.')
    .describe('help', 'Print usage.')
    .describe('version', 'Print current version.');
};


var processOptions = function(argv) {
  argv = optimist.parse(argv || process.argv);

  if (argv.help) {
    console.log(optimist.help());
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

  if (util.isString(options.colors)) {
    options.colors = options.colors === 'true';
  }

  if (util.isString(options.logLevel)) {
    options.logLevel = constant['LOG_' + options.logLevel.toUpperCase()] || constant.LOG_DISABLE;
  }

  if (util.isString(options.singleRun)) {
    options.singleRun = options.singleRun === 'true';
  }

  if (util.isString(options.browsers)) {
    options.browsers = options.browsers.split(',');
  }

  options.configFile = argv._[2] || 'testacular.conf';

  return options;
};


exports.runner = function() {
  optimist.usage('Execute - send execute command to Testacular server.\nUsage: $0 [options]');
  sharedConfig();

  return processOptions();
};


exports.server = function(argv) {
  optimist
    .usage('Start Testacular server.\nUsage: $0 [configFile] [options]')
    .describe('port', '<integer> Port where the web server is running.')
    .describe('auto-watch', 'Auto watch source files and run on change.')
    .describe('no-auto-watch', 'Do not watch source files.')
    .describe('auto-watch-interval', '<integer> Interval for OS that do polling, in ms.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('reporter', '<progress | dots> How the results are reported.')
    .describe('browsers', 'List of browsers to start (eg. --browsers Chrome,ChromeCanary,Firefox).')
    .describe('single-run', 'Run the test when browsers captured and exit.')
    .describe('no-single-run', 'Disable single-run.');

  sharedConfig();

  return processOptions(argv);
};
