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
  this.mtime = mtime;
  this.content = content || '';
  this.getStats = function() {
    return new Stats(true, new Date(this.mtime));
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
  var watchers = {};

  var getPointer = function(path, pointer) {
    var parts = path.split('/').slice(1);

    while (parts.length) {
      if (!pointer[parts[0]]) break;
      pointer = pointer[parts.shift()];
    }

    return parts.length ? null : pointer;
  };

  var validatePath = function(path) {
    if (path.charAt(0) !== '/') {
      throw new Error('Relative path not supported !');
    }
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
      var data = null;
      var error = null;

      try {
        data = readFileSync(path);
      } catch(e) {
        error = e;
      }

      callback(error, data);
    });
  };

  this.readFileSync = function(path) {
    var pointer = getPointer(path, structure);

    if (!pointer) {
      throw new Error(util.format('No such file or directory "%s"', path));
    }

    if (pointer instanceof File) {
      return pointer.getBuffer();
    }

    if (typeof pointer === 'object') {
      throw new Error('Illegal operation on directory');
    }

    return new Buffer('');
  };

  this.watchFile = function(path, callback) {
    watchers[path] = watchers[path] || [];
    watchers[path].push(callback);
  };

  // Mock API
  this._touchFile = function(path, mtime, content) {
    var pointer = getPointer(path, structure);
    var previous = pointer.getStats();

    // update the file
    if (typeof mtime !== 'undefined') pointer.mtime = mtime;
    if (typeof content !== 'undefined') pointer.content = content;

    var current = pointer.getStats();
    (watchers[path] || []).forEach(function(callback) {
      callback(current, previous);
    });
  };


};

exports.create = function(structure) {
  return new Mock(structure);
};

exports.file = function(mtime, content) {
  return new File(mtime, content);
};
