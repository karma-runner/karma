var chokidar = require('chokidar');
var util = require('./util');
var log = require('./logger').create('watcher');

// Get parent folder, that be watched (does not contain any special globbing character)
var baseDirFromPattern = function(pattern) {
  return pattern.replace(/\/[^\/]*[\*\(].*$/, '') || '/';
};

var watchPatterns = function(patterns, watcher) {

  // filter only unique non url patterns paths
  var pathsToWatch = [];
  var uniqueMap = {};
  var path;
  patterns.forEach(function(pattern, i) {
    if (!util.isUrlAbsolute(pattern)) {
      path = baseDirFromPattern(pattern);
      if (!uniqueMap[path]) {
        uniqueMap[path] = true;
        pathsToWatch.push(path);
      }
    }
  });

  // watch only common parents, no sub paths
  pathsToWatch.forEach(function(path) {
    if (!pathsToWatch.some(function(p) {
      return p !== path && path.substr(0, p.length) === p;
    })) {
      watcher.add(path);
      log.debug('Watching "%s"', path);
    }
  });
};

exports.watch = function(patterns, fileList) {
  // TODO(vojta): pass ignored function to not watch unnecessary files
  var chokidarWatcher = new chokidar.FSWatcher();

  watchPatterns(patterns, chokidarWatcher);

  var bind = function(fn) {
    return function(path) {
      return fn.call(fileList, util.normalizeWinPath(path));
    };
  };

  // register events
  chokidarWatcher.on('add', bind(fileList.addFile))
                 .on('change', bind(fileList.changeFile))
                 .on('unlink', bind(fileList.removeFile));

  return chokidarWatcher;
};
