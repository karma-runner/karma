var Gaze = require('gaze').Gaze;
var globule = require('globule');
var helper = require('./helper');
var log = require('./logger').create('watcher');
var path = require('path');

var onlyWatchedTrue = function(pattern) {
  return pattern.watched;
};

var relativePath = function(base) {
  return function(absPath) {
    return path.relative(base, absPath);
  };
};

var getWatchedPatterns = function(patternObjects, base) {
  return patternObjects.filter(onlyWatchedTrue).map(function(patternObject) {
    return relativePath(base)(patternObject.pattern);
  });
};

exports.watch = function(patterns, excludes, fileList, usePolling, basePath) {
  var watchedPatterns = getWatchedPatterns(patterns, basePath);
  var excludedPatterns = excludes.map(relativePath(basePath));

  var options = {
    mode: usePolling ? 'poll' : 'auto',
    debounceDelay: 50,
    cwd: basePath
  };

  var gaze = new Gaze(watchedPatterns, options, function(err) {
    if (err) {
      return log.error('Error watching files', err);
    }

    var bind = function(fn) {
      return function(path) {
        return fn.call(fileList, helper.normalizeWinPath(path));
      };
    };

    this.on('added', bind(fileList.addFile));
    this.on('changed', bind(fileList.changeFile));
    this.on('deleted', bind(fileList.removeFile));

    this.on('error', function(err) {
      log.error('File watcher error', err);
    });

    //Unwatch excluded files.  file_list deals with excluded files that are added at runtime.
    var excluded = globule.find(excludedPatterns, {cwd: basePath});
    excluded.map(this.remove);
    excluded.map(function(file) {
      log.info('Excluding from watched files:', file);
    });

  });

  return gaze;

};

exports.watch.$inject = [
  'config.files',
  'config.exclude',
  'fileList',
  'config.usePolling',
  'config.basePath'
];
