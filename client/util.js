exports.instanceOf = function(value, constructorName) {
  return Object.prototype.toString.apply(value) === '[object ' + constructorName + ']';
};

exports.elm = function(id) {
  return document.getElementById(id);
};

exports.generateId = function(prefix) {
  return prefix + Math.floor(Math.random() * 10000);
};

exports.isUndefined = function(value) {
  return typeof value === 'undefined';
};

exports.isDefined = function(value) {
  return !exports.isUndefined(value);
};
