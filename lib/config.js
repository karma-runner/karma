var fs = require('fs');
var path = require('path');
var vm = require('vm');
var coffee = require('coffee-script');

var log = require('./logger').create('config');
var helper = require('./helper');
var constant = require('./constants');


var Pattern = function(pattern, served, included, watched) {
  this.pattern = pattern;
  this.served = helper.isDefined(served) ? served : true;
  this.included = helper.isDefined(included) ? included : true;
  this.watched = helper.isDefined(watched) ? watched : true;
};

var UrlPattern = function(url) {
  Pattern.call(this, url, false, true, false);
};


var createPatternObject = function(pattern) {
  if (helper.isString(pattern)) {
    return helper.isUrlAbsolute(pattern) ? new UrlPattern(pattern) : new Pattern(pattern);
  }

  if (helper.isObject(pattern)) {
    if (!helper.isDefined(pattern.pattern)) {
      log.warn('Invalid pattern %s!\n\tObject is missing "pattern" property".', pattern);
    }

    return helper.isUrlAbsolute(pattern.pattern) ?
        new UrlPattern(pattern.pattern) :
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

    normalizedPreprocessors[normalizedPattern] = helper.isString(preprocessors[pattern]) ?
        [preprocessors[pattern]] : preprocessors[pattern];
  });

  return config;
};


var readConfigFile = function(filepath) {
  var configEnv = {
    // constants
    LOG_DISABLE: constant.LOG_DISABLE,
    LOG_ERROR:   constant.LOG_ERROR,
    LOG_WARN:    constant.LOG_WARN,
    LOG_INFO:    constant.LOG_INFO,
    LOG_DEBUG:   constant.LOG_DEBUG,
    // access to globals
    console: console,
    require: require,
    process: process,
    __filename: filepath,
    __dirname: path.dirname(filepath)
  };


  // TODO(vojta): remove
  var CONST_ERR = '%s is not supported anymore.\n\tPlease use `frameworks = ["%s"];` instead.';
  ['JASMINE', 'MOCHA', 'QUNIT'].forEach(function(framework) {
    [framework, framework + '_ADAPTER'].forEach(function(name) {
      Object.defineProperty(configEnv, name, {get: function() {
        log.warn(CONST_ERR, name, framework.toLowerCase());
      }});
    });
  });

  ['REQUIRE', 'REQUIRE_ADAPTER'].forEach(function(name) {
    Object.defineProperty(configEnv, name, {get: function() {
      log.warn(CONST_ERR, name, 'requirejs');
    }});
  });

  ['ANGULAR_SCENARIO', 'ANGULAR_SCENARIO_ADAPTER'].forEach(function(name) {
    Object.defineProperty(configEnv, name, {get: function() {
      log.warn(CONST_ERR, name, 'requirejs');
    }});
  });

  var configSrc;
  try {
    configSrc = fs.readFileSync(filepath);
  } catch(e) {
    if (e.code === 'ENOENT' || e.code === 'EISDIR') {
      log.error('Config file does not exist!');
    } else {
      log.error('Unexpected error opening config file!\n', e);
    }

    process.exit(1);
  }

  try {
    // if the configuration file is coffeescript compile it
    if (path.extname(filepath) === '.coffee') {
      configSrc = coffee.compile(configSrc.toString(), {bare: true});
    }

    vm.runInNewContext(configSrc, configEnv);
  } catch(e) {
    if (e.name === 'SyntaxError') {
      log.error('Syntax error in config file!\n' + e.message);
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
    frameworks: [],
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
    loggers: [ constant.CONSOLE_APPENDER ],
    plugins: [
      'karma-jasmine',
      'karma-requirejs',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-coffee-preprocessor'
    ]
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

    // always ignore the config file itself
    config.exclude.push(configFilePath);
  }
  else {
    config.basePath = path.resolve(config.basePath);
  }

  return normalizeConfig(config);
};


// PUBLIC API
exports.parseConfig = parseConfig;
exports.Pattern = Pattern;
exports.createPatternObject = createPatternObject;
