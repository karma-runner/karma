var path = require('path');
var optimist = require('optimist');
var helper = require('./helper');
var constant = require('./constants');


var processArgs = function(argv, options) {

  if (argv.help) {
    console.log(optimist.help());
    process.exit(0);
  }

  if (argv.version) {
    console.log('Karma version: ' + constant.VERSION);
    process.exit(0);
  }

  // TODO(vojta): warn/throw when unknown argument (probably mispelled)
  Object.getOwnPropertyNames(argv).forEach(function(name) {
    if (name !== '_' && name !== '$0') {
      options[helper.dashToCamel(name)] = argv[name];
    }
  });

  if (helper.isString(options.autoWatch)) {
    options.autoWatch = options.autoWatch === 'true';
  }

  if (helper.isString(options.colors)) {
    options.colors = options.colors === 'true';
  }

  if (helper.isString(options.logLevel)) {
    options.logLevel = constant['LOG_' + options.logLevel.toUpperCase()] || constant.LOG_DISABLE;
  }

  if (helper.isString(options.singleRun)) {
    options.singleRun = options.singleRun === 'true';
  }

  if (helper.isString(options.browsers)) {
    options.browsers = options.browsers.split(',');
  }

  if (options.reportSlowerThan === false) {
    options.reportSlowerThan = 0;
  }

  if (helper.isString(options.reporters)) {
    options.reporters = options.reporters.split(',');
  }

  options.configFile = path.resolve(argv._.shift() || 'karma.conf.js');

  return options;
};


var describeShared = function() {
  optimist
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
           'Usage:\n' +
           '  $0 <command>\n\n' +
           'Commands:\n' +
           '  start [<configFile>] [<options>] Start the server / do single run.\n' +
           '  init [<configFile>] Initialize a config file.\n' +
           '  run [<options>] Trigger a test run.\n\n' +
           'Run --help with particular command to see its description and available options.')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.');
};


var describeInit = function() {
  optimist
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
           'INIT - Initialize a config file.\n\n' +
           'Usage:\n' +
           '  $0 init [<configFile>]')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.');
};


var describeStart = function() {
  optimist
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
           'START - Start the server / do a single run.\n\n' +
           'Usage:\n' +
           '  $0 start [<configFile>] [<options>]')
    .describe('port', '<integer> Port where the web server is running.')
    .describe('runner-port', '<integer> Port where the server is listening for runner.')
    .describe('auto-watch', 'Auto watch source files and run on change.')
    .describe('no-auto-watch', 'Do not watch source files.')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('reporters', 'List of reporters (available: dots, progress, junit).')
    .describe('browsers', 'List of browsers to start (eg. --browsers Chrome,ChromeCanary,Firefox).')
    .describe('capture-timeout', '<integer> Kill browser if does not capture in given time [ms].')
    .describe('single-run', 'Run the test when browsers captured and exit.')
    .describe('no-single-run', 'Disable single-run.')
    .describe('report-slower-than', '<integer> Report tests that are slower than given time [ms].')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.');
};


var describeRun = function() {
  optimist
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
           'RUN - Run the tests (requires running server).\n\n' +
      'Usage:\n' +
      '  $0 run [<options>]')
    .describe('runner-port', '<integer> Port where the server is listening for runner.')
    .describe('help', 'Print usage.')
    .describe('version', 'Print current version.');
};


exports.process = function() {

  var argv = optimist.argv;
  var options = {
    cmd: argv._.shift()
  };

  switch (options.cmd) {
    case 'start':
      describeStart();
      break;

    case 'run':
      describeRun();
      break;

    case 'init':
      describeInit();
      break;

    default:
      describeShared();
      if (!options.cmd) {
        processArgs(argv, options);
        console.error('Command not specified.');
      } else {
        console.error('Unknown command "' + options.cmd + '".');
      }
      optimist.showHelp();
      process.exit(1);
  }

  return processArgs(argv, options);
};

// just for testing
exports.processArgs = processArgs;
