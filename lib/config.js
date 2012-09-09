// parse the configuration
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var log = require('./logger').create('config');
var util = require('./util');
var constant = require('./constants');


var normalizeConfig = function(config) {

  var basePathResolve = function(relativePath) {
    if (util.isUrlAbsolute(relativePath)) {
      return relativePath;
    }

    return path.resolve(config.basePath, relativePath);
  };

  config.files = config.files.map(basePathResolve);
  config.exclude = config.exclude.map(basePathResolve);

  var normalizeWinPath = function(path) {
    return path.replace(/\\/g, '/');
  };

  // normalize paths on windows
  config.basePath = util.normalizeWinPath(config.basePath);
  config.files = config.files.map(util.normalizeWinPath);
  config.exclude = config.exclude.map(util.normalizeWinPath);

  // normalize urlRoot
  var urlRoot = config.urlRoot;
  if (urlRoot.charAt(0) !== '/') {
    urlRoot = '/' + urlRoot;
  }

  if (urlRoot.charAt(urlRoot.length - 1) !== '/') {
    urlRoot = urlRoot + '/';
  }

  if (urlRoot !== config.urlRoot) {
    log.warn('urlRoot normalized to "%s"', urlRoot);
    config.urlRoot = urlRoot;
  }

  return config;
};


// TODO(vojta): return only config, remove the other mess which leaks memory (require, globals, etc)
var parseConfig = function(configFilePath, cliOptions) {

  // default config
  var config = {
    port: constant.DEFAULT_PORT,
    runnerPort: constant.DEFAULT_RUNNER_PORT,
    basePath: '',
    files: [],
    exclude: [],
    logLevel: constant.LOG_INFO,
    colors: true,
    autoWatch: false,
    reporter: 'progress',
    singleRun: false,
    browsers: [],
    proxies: {},
    urlRoot: '/',
    reportSlowerThan: 0
  };

  var ADAPTER_DIR = __dirname + '/../adapter';
  var configEnv = {
    // constants
    LOG_DISABLE: constant.LOG_DISABLE,
    LOG_ERROR:   constant.LOG_ERROR,
    LOG_WARN:    constant.LOG_WARN,
    LOG_INFO:    constant.LOG_INFO,
    LOG_DEBUG:   constant.LOG_DEBUG,
    JASMINE: ADAPTER_DIR + '/lib/jasmine.js',
    JASMINE_ADAPTER: ADAPTER_DIR + '/jasmine.js',
    MOCHA: ADAPTER_DIR + '/lib/mocha.js',
    MOCHA_ADAPTER: ADAPTER_DIR + '/mocha.js',
    ANGULAR_SCENARIO: ADAPTER_DIR + '/lib/angular-scenario.js',
    ANGULAR_SCENARIO_ADAPTER: ADAPTER_DIR + '/angular-scenario.js',
    // access to globals
    console: console,
    require: require,
    __filename: configFilePath,
    __dirname: path.dirname(configFilePath)
  };

  try {
    vm.runInNewContext(fs.readFileSync(configFilePath), configEnv);
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

  // merge the config from config file
  Object.getOwnPropertyNames(config).forEach(function(key) {
    if (configEnv.hasOwnProperty(key)) {
      config[key] = configEnv[key];
    }
  });

  // merge options from cli
  config = util.merge(config, cliOptions || {});

  // resolve basePath
  config.basePath = path.resolve(path.dirname(configFilePath), config.basePath);

  return normalizeConfig(config);
};


// PUBLIC API
exports.parseConfig = parseConfig;
