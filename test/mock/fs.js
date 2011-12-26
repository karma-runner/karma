// mock for fs module
// TODO(vojta): allow relative paths
var util = require('util');

/**
 * @constructor
 * @param {boolean} isDirectory
 */
var Stats = function(isFile, mtime) {
  this.mtime = mtime;
  this.isDirectory = function() {
    return !isFile;
  };
  this.isFile = function() {
    return isFile;
  };
};

var File = function(mtime, content) {
  this.mtime = new Date(mtime);
  this.content = content || '';
  this.getStats = function() {
    return new Stats(true, this.mtime);
  };
  this.getBuffer = function() {
    return new Buffer(this.content);
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
      if (!pointer) return callback({});

      var stats = pointer instanceof File ? pointer.getStats() :
                                            new Stats(typeof pointer !== 'object')
      return callback(null, stats);
    });
  };

  this.readdir = function(path, callback) {
    validatePath(path);
    process.nextTick(function() {
      var pointer = getPointer(path, structure);
      return pointer && typeof pointer === 'object' && !(pointer instanceof File) ?
             callback(null, Object.getOwnPropertyNames(pointer).sort()) : callback({});
    });
  };

  this.readFile = function(path, callback) {
    var readFileSync = this.readFileSync;
    process.nextTick(function() {
      try {
        callback(null, readFileSync(path));
      } catch(e) {
        callback(e);
      }
    })
  };

  this.readFileSync = function(path) {
    var pointer = getPointer(path, structure);

    if (!pointer) throw Error(util.format('no such file or directory "%s"', path));
    if (pointer instanceof File) return pointer.getBuffer();
    if (typeof pointer === 'object') throw Error('illegal operation on directory');
    return '';
  };
};

exports.create = function(structure) {
  return new Mock(structure);
};

exports.file = function(mtime, content) {
  return new File(mtime, content);
};
