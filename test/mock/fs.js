// mock for fs module
// TODO(vojta): allow relative paths

/**
 * @constructor
 * @param {boolean} isDirectory
 */
var Stats = function(isDirectory) {
  this.isDirectory = function() {
    return isDirectory;
  };
};

/**
 * @constructor
 * @param {Object} structure
 */
var Mock = function(structure) {
  var getPointer = function(path, pointer) {
    var parts = path.split('/').slice(1);

    while (parts.length) {
      if (!pointer[parts[0]]) break;
      pointer = pointer[parts.shift()];
    }

    return parts.length ? null : pointer;
  };

  var validatePath = function(path) {
    if (path.charAt(0) !== '/') throw 'Relative path not supported !';
  };

  // public API
  this.stat = function(path, callback) {
    validatePath(path);
    process.nextTick(function() {
      var pointer = getPointer(path, structure);
      return pointer ? callback(null, new Stats(typeof pointer == 'object')) :
                       callback({});
    });
  };

  this.readdir = function(path, callback) {
    validatePath(path);
    process.nextTick(function() {
      var pointer = getPointer(path, structure);
      return pointer && typeof pointer === 'object' ?
             callback(null, Object.getOwnPropertyNames(pointer)) : callback({});
    });
  };
};

exports.create = function(structure) {
  return new Mock(structure);
};
