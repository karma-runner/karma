var LEVELS = ['error', 'warn', 'info', 'debug'];
var COLORS = [ 31,      33,     36,     90];

var globalConfig = {
  logLevel: 2,
  useColors: false
};

var isDefined = function(value) {
  return typeof value !== 'undefined';
};

var Logger = function(name, level) {
  var createMethod = function(type) {
    return function() {
      var currentLevel =  isDefined(level) ? level : globalConfig.logLevel;
      var index = LEVELS.indexOf(type);

      // ignore
      if (index > currentLevel) return;

      var args = Array.prototype.slice.call(arguments);
      var prefix = type + ' (' + name + '):';

      if (globalConfig.useColors) {
        prefix = '\033[' + COLORS[index] + 'm' + prefix + '\033[39m';
      }
      console.log.apply(console, [prefix].concat(args));
    };
  };

  // define public methods: error, warn, info, debug
  LEVELS.forEach(function(level) {
    this[level] = createMethod(level);
  }, this);
};

exports.create = function(name, level) {
  return new Logger(name, level);
};

exports.setLevel = function(level) {
  globalConfig.logLevel = level;
};

exports.useColors = function(use) {
  globalConfig.useColors = !!use;
};
