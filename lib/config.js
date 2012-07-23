// parse the configuration
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var log = require('./logger').create('config');
var util = require('./util');
var constant = require('./constants');


// TODO(vojta): return only config, remove the other mess which leaks memory (require, globals, etc)
var parseConfig = function(configFilePath, cliOptions) {

  var config = {
    // default configuration
    port: constant.DEFAULT_PORT,
    runnerPort: constant.DEFAULT_RUNNER_PORT,
    basePath: path.dirname(configFilePath),
    files: [],
    exclude: [],
    logLevel: constant.LOG_INFO,
    colors: true,
    autoWatch: false,
    autoWatchInterval: 0,
    reporter: 'progress',

    // constants
    LOG_DISABLE: constant.LOG_DISABLE,
    LOG_ERROR:   constant.LOG_ERROR,
    LOG_WARN:    constant.LOG_WARN,
    LOG_INFO:    constant.LOG_INFO,
    LOG_DEBUG:   constant.LOG_DEBUG,
    JASMINE: __dirname + '/../adapter/lib/jasmine.js',
    JASMINE_ADAPTER: __dirname + '/../adapter/jasmine.js',

    // access to globals
    console: console,
    require: require
  };

  try {
    vm.runInNewContext(fs.readFileSync(configFilePath), config);
  } catch(e) {
    if (e.name === 'SyntaxError') {
      log.error('Syntax error in config file!\n' + e.message);
    } else if (e.code === 'ENOENT' || e.code === 'EISDIR') {
      log.error('Config file does not exist!');
    } else {
      log.error('Invalid config file!\n', e);
    }

    process.exit(1);
  }


  // resolve basePath
  config.basePath = path.resolve(path.dirname(configFilePath), config.basePath);

  var basePathResolve = function(relativePath) {
    if (util.isUrlAbsolute(relativePath)) return relativePath;
    return path.resolve(config.basePath, relativePath);
  };

  // TODO(vojta): fix this !!! CLI basepath needs to be merged before resolving
  config.files = config.files.map(basePathResolve);
  config.exclude = config.exclude.map(basePathResolve);

  // merge options from CLI
  return util.merge(config, cliOptions || {});
};


// PUBLIC API
exports.parseConfig = parseConfig;
