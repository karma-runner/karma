var BROWSER = /(Chrome|Firefox|Opera|Safari)\/([0-9]*\.[0-9]*)/;
var VERSION = /Version\/([0-9]*\.[0-9]*)/;
var MSIE = /MSIE ([0-9]*\.[0-9]*)/;

// TODO(vojta): parse IE, Android, iPhone, etc...
exports.browserFullNameToShort = function(fullName) {
  var browserMatch = fullName.match(BROWSER);
  if (browserMatch) {
    var versionMatch = fullName.match(VERSION);
    return browserMatch[1] + ' ' + (versionMatch && versionMatch[1] || browserMatch[2]);
  }

  var ieMatch = fullName.match(MSIE);
  if (ieMatch) {
    return 'IE ' + ieMatch[1];
  }

  return fullName;
};


exports.formatError = function(msg, indentation) {
  // remove domain and timestamp from source files
  msg = msg.replace(/https?:\/\/[^\/]*([^\?\s]*)(\?[0-9]*)?/g, '$1');

  // indent every line
  if (indentation) {
    msg = indentation + msg.replace(/\n/g, '\n' + indentation);
  }

  return msg + '\n';
};


exports.isDefined = function(value) {
  return typeof value !== 'undefined';
};


exports.isFunction = function(value) {
  return typeof value === 'function';
};


exports.isString = function(value) {
  return typeof value === 'string';
};


exports.isUrlAbsolute = function(url) {
  return /^https?:\/\//.test(url);
};


exports.camelToSnake = function(camelCase) {
  return camelCase.replace(/[A-Z]/g, function(match, pos) {
    return (pos > 0 ? '_' : '') + match.toLowerCase();
  });
};


exports.ucFirst = function(word) {
  return word.charAt(0).toUpperCase() + word.substr(1);
};


exports.dashToCamel = function(dash) {
  var words = dash.split('-');
  return words.shift() + words.map(exports.ucFirst).join('');
};


exports.arrayRemove = function(collection, item) {
  var idx = collection.indexOf(item);

  if (idx !== -1) {
    collection.splice(idx, 1);
    return true;
  }

  return false;
};


exports.merge = function() {
  return Array.prototype.slice.call(arguments, 0).reduce(function(result, object) {
    Object.getOwnPropertyNames(object).forEach(function(name) {
      result[name] = object[name];
    });
    return result;
  }, {});
};
