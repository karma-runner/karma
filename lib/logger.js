var levels = ['error', 'warn', 'info', 'debug'],
    globalLevel = 2;

var isDefined = function(value) {
  return typeof value !== 'undefined';
};

var Logger = function(name, level) {
  var createMethod = function(type) {
    return function() {
      var currentLevel =  isDefined(level) && level || globalLevel;

      if (currentLevel < levels.indexOf(type)) return;

      var args = Array.prototype.slice.call(arguments);
      console.log.apply(console, [type + ' - ' + name + ': '].concat(args));
    };
  };

  // define public methods: error, warn, info, debug
  levels.forEach(function(level) {
    this[level] = createMethod(level);
  }, this);
};

exports.create = function(name, level) {
  return new Logger(name, level);
};

exports.setLevel = function(level) {
  globalLevel = level;
};
