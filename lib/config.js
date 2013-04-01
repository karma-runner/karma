var fs = require('fs');
var path = require('path');
var vm = require('vm');
var coffee = require('coffee-script');

var log = require('./logger').create('config');
var helper = require('./helper');
var constant = require('./constants');


// TODO(vojta): if URL, default to served false, included true, watched false
var Pattern = function(pattern, served, included, watched) {
  this.pattern = pattern;
  this.served = helper.isDefined(served) ? served : true;
  this.included = helper.isDefined(included) ? included : true;
  this.watched = helper.isDefined(watched) ? watched : true;
};


var createPatternObject = function(pattern) {
  if (helper.isString(pattern)) {
    return helper.isUrlAbsolute(pattern) ?
        new Pattern(pattern, false, true, false) :
        new Pattern(pattern);
  }

  if (helper.isObject(pattern)) {
    if (!helper.isDefined(pattern.pattern)) {
      log.warn('Invalid pattern %s!\n\tObject is missing "pattern" property".', pattern);
    }

    return helper.isUrlAbsolute(pattern.pattern) ?
        new Pattern(pattern.pattern, false, true, false) :
        new Pattern(pattern.pattern, pattern.served, pattern.included, pattern.watched);
  }

  log.warn('Invalid pattern %s!\n\tExpected string or object with "pattern" property.', pattern);
  return new Pattern(null, false, false, false);
};


var normalizeConfig = function(config) {

  var basePathResolve = function(relativePath) {
    if (helper.isUrlAbsolute(relativePath)) {
      return relativePath;
    }

    if (!helper.isDefined(config.basePath) || !helper.isDefined(relativePath)) {
      return '';
    }
    return path.resolve(config.basePath, relativePath);
  };

  var createPatternMapper = function(resolve) {
    return function(objectPattern) {
      objectPattern.pattern = resolve(objectPattern.pattern);

      return objectPattern;
    };
  };

  config.files = config.files.map(createPatternObject).map(createPatternMapper(basePathResolve));
  config.exclude = config.exclude.map(basePathResolve);
  config.junitReporter.outputFile = basePathResolve(config.junitReporter.outputFile);
  config.coverageReporter.dir = basePathResolve(config.coverageReporter.dir);

  // normalize paths on windows
  config.basePath = helper.normalizeWinPath(config.basePath);
  config.files = config.files.map(createPatternMapper(helper.normalizeWinPath));
  config.exclude = config.exclude.map(helper.normalizeWinPath);
  config.junitReporter.outputFile = helper.normalizeWinPath(config.junitReporter.outputFile);
  config.coverageReporter.dir = helper.normalizeWinPath(config.coverageReporter.dir);

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

  if (config.proxies && config.proxies.hasOwnProperty(config.urlRoot)) {
    log.warn('"%s" is proxied, you should probably change urlRoot to avoid conflicts',
        config.urlRoot);
  }

  if (config.singleRun && config.autoWatch) {
    log.debug('autoWatch set to false, because of singleRun');
    config.autoWatch = false;
  }

  if (helper.isString(config.reporters)) {
    config.reporters = config.reporters.split(',');
  }

  // TODO(vojta): remove
  if (helper.isDefined(config.reporter)) {
    log.warn('"reporter" is deprecated, use "reporters" instead');
  }

  // normalize preprocessors
  var preprocessors = config.preprocessors || {};
  var normalizedPreprocessors = config.preprocessors = Object.create(null);

  Object.keys(preprocessors).forEach(function(pattern) {
    var normalizedPattern = helper.normalizeWinPath(basePathResolve(pattern));

    normalizedPreprocessors[normalizedPattern] = preprocessors[pattern];
  });

  return config;
};


var readConfigFile = function(filepath) {
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
    REQUIRE: ADAPTER_DIR + '/lib/require.js',
    REQUIRE_ADAPTER: ADAPTER_DIR + '/require.js',
    QUNIT: ADAPTER_DIR + '/lib/qunit.js',
    QUNIT_ADAPTER: ADAPTER_DIR + '/qunit.js',
    // access to globals
    console: console,
    require: require,
    process: process,
    __filename: filepath,
    __dirname: path.dirname(filepath)
  };

  try {
    var configSrc = fs.readFileSync(filepath);

    // if the configuration file is coffeescript compile it
    if (path.extname(filepath) === '.coffee') {
      configSrc = coffee.compile(configSrc.toString(), {bare: true});
    }

    vm.runInNewContext(configSrc, configEnv);
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

  return configEnv;
};


var parseConfig = function(configFilePath, cliOptions) {

  var configFromFile = helper.isString(configFilePath) ? readConfigFile(configFilePath) : {};

  // default config
  var config = {
    port: constant.DEFAULT_PORT,
    runnerPort: constant.DEFAULT_RUNNER_PORT,
    hostname: constant.DEFAULT_HOSTNAME,
    basePath: '',
    files: [],
    exclude: [],
    logLevel: constant.LOG_INFO,
    colors: true,
    autoWatch: false,
    reporters: ['progress'],
    singleRun: false,
    browsers: [],
    captureTimeout: 60000,
    proxies: {},
    preprocessors: {'**/*.coffee': 'coffee'},
    urlRoot: '/',
    reportSlowerThan: 0,
    junitReporter: {
      outputFile: 'test-results.xml',
      suite: ''
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
    loggers: [ constant.CONSOLE_APPENDER ]
  };

  // merge the config from config file and cliOptions (precendense)
  Object.getOwnPropertyNames(config).forEach(function(key) {
    if (cliOptions.hasOwnProperty(key)) {
      config[key] = cliOptions[key];
    } else if (configFromFile.hasOwnProperty(key)) {
      config[key] = configFromFile[key];
    }
  });

  if (helper.isString(configFilePath)) {
    // resolve basePath
    config.basePath = path.resolve(path.dirname(configFilePath), config.basePath);
  }

  return normalizeConfig(config);
};


// PUBLIC API
exports.parseConfig = parseConfig;
exports.Pattern = Pattern;
exports.createPatternObject = createPatternObject;
