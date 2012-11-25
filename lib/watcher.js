var chokidar = require('chokidar');
var mm = require('minimatch');

var helper = require('./helper');
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

  patterns.forEach(function(patternObject) {
    var pattern = patternObject.pattern;

    if (!patternObject.watched) {
      return;
    }

    path = baseDirFromPattern(pattern);
    if (!uniqueMap[path]) {
      uniqueMap[path] = true;
      pathsToWatch.push(path);
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

// Function to test if an item is on the exclude list
// and therefore should not be watched by chokidar
// TODO(vojta): ignore non-matched files as well
var createIgnore = function(excludes) {
  return function(item) {
    var matchExclude = function(pattern) {
      log.debug('Excluding %s', pattern);
      return mm(item, pattern, {dot: true});
    };
    return excludes.some(matchExclude);
  };
};

exports.watch = function(patterns, excludes, fileList) {
  var options = {
    ignorePermissionErrors: true,
    ignored: createIgnore(excludes)
  };
  var chokidarWatcher = new chokidar.FSWatcher(options);

  watchPatterns(patterns, chokidarWatcher);

  var bind = function(fn) {
    return function(path) {
      return fn.call(fileList, helper.normalizeWinPath(path));
    };
  };

  // register events
  chokidarWatcher.on('add', bind(fileList.addFile))
                 .on('change', bind(fileList.changeFile))
                 .on('unlink', bind(fileList.removeFile));

  return chokidarWatcher;
};
