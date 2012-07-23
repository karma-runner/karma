var chokidar = require('chokidar');
var util = require('./util');
var log = require('./logger').create('watcher');

// Get parent folder, that be watched (does not contain any special globbing character)
var baseDirFromPattern = function(pattern) {
  return pattern.replace(/\/[^\/]*[\*\(].*$/, '') || '/';
};

var watchPatterns = function(patterns, watcher) {

  // TODO(vojta): don't watch same path twice, don't watch sub paths
  patterns.forEach(function(pattern, i) {
    if (util.isUrlAbsolute(pattern)) {
      return;
    }

    var watchedPattern = baseDirFromPattern(pattern);

    watcher.add(watchedPattern);
    log.info('Watching "%s"', watchedPattern);
  });
};

exports.watch = function(patterns, fileList) {
  // TODO(vojta): pass ignored function to not watch unnecessary files
  var chokidarWatcher = new chokidar.FSWatcher();

  watchPatterns(patterns, chokidarWatcher);

  // register events
  chokidarWatcher.on('add', fileList.addFile.bind(fileList))
                 .on('change', fileList.changeFile.bind(fileList))
                 .on('unlink', fileList.removeFile.bind(fileList));

  return chokidarWatcher;
};
