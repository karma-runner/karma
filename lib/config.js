// parse the configuration
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var EventEmitter = require('events').EventEmitter;
var log = require('./logger').create('config');

/**
 * Resolve given path pattern and returns array of mathing files
 *
 * @param {string} pattern Pattern to match
 * @param {function(err, files)} done Callback
 */
var resolveSinglePattern = function(pattern, done) {
  var parts = [];
  var results = [];
  var waiting = 0;

  // split pattern into parts (delimiter contains wildchar *)
  // + normalize parts - remove empty elements
  // if the path contains two "delimiters", e.g. /s/*/*.js
  // or if the path ends with "delimiter", e.g. /some/*.x
  pattern.split(/(\/[^\/\*]*\*[^\/\*]*)/).forEach(function(str) {
    if (str) parts.push(str);
  });

  /**
   * Finish one job, if all jobs finished, call done callback with result
   * TODO(vojta): use some library for this (q ?)
   */
  var finish = function() {
    waiting--;
    if (!waiting) {
      // sort the results by path,
      // as the async fs callbacks might return in unpredictable order
      results.sort(function(a, b) {
        return a.path > b.path;
      });
      done(null, results);
    }
  };

  /**
   * Process given path (explore)
   *
   * @param {string} path Path to process
   * @param {number} pointer Index of the next part to process
   */
  var processPath = function(path, pointer) {
    waiting++;

    fs.stat(path, function(err, stat) {
      if (err) return finish();
      if (stat.isDirectory()) {
        // end of pattern, we don't want directory...
        if (pointer === parts.length) return finish();

        var regexp = new RegExp('^' +
                                parts[pointer].substr(1).    // get next part, remove '/'
                                replace(/\./g, '\\.').       // escape '.'
                                replace(/\*/g, '.*') + '$'); // replace * to match any string

        fs.readdir(path, function(err, files) {
          files.forEach(function(file) {
            // forking - process matching nodes...
            if (regexp.test(file)) processPath(path + '/' + file, pointer + 1);
          });
          return finish();
        });
        return null;
      } else {
        // it's a file - if end of pattern, accept the path
        if (pointer === parts.length) results.push({path: path, mtime: stat.mtime});
        return finish();
      }
    });
  };

  return processPath(parts[0], 1);
};

/**
 * Resolve given array of patterns and return array of matched files
 * - unique files
 * - absolute paths
 *
 * @param {Array.<string>} patterns Array of patterns
 * @param {Array.<string>} exclude Array of patterns to exlclude
 * @param {function(err, files)} done Callback
 */
var resolve = function(patterns, exclude, done) {
  var resultSets = new Array(patterns.length);
  var waiting = 0;

  var excludeRegExps = exclude.map(function(pattern) {
    // TODO(vojta): escape the pattern
    return new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  });

  patterns.forEach(function(pattern, index) {
    waiting++;

    resolveSinglePattern(pattern, function(err, files) {
      resultSets[index] = files;
      waiting--;

      if (!waiting) {
        var uniquePaths = [];
        var uniqueResults = [];

        // merge all result sets
        resultSets.forEach(function(set) {
          set.forEach(function(file) {
            if (uniquePaths.indexOf(file.path) === -1) {
              uniquePaths.push(file.path);

              // add only if does not match any exclude pattern
              if (excludeRegExps.some(function(exclude) {
                return exclude.test(file.path);
              })) {
                log.debug('Excluded file ' + file.path);
              } else {
                uniqueResults.push(file);
                log.debug('Resolved file ' + file.path);
              }
            }
          });
        });

        done(null, uniqueResults);
      }
    });
  });
};


var parseConfig = function(configFilePath) {

  var config = {
    // default configuration
    port: 8080,
    runnerPort: 1337,
    basePath: '',
    files: [],
    exclude: [],
    logLevel: 3,
    logColors: true,
    autoWatch: false,
    autoWatchInterval: 0,

    // constants
    LOG_DISABLE: -1,
    LOG_ERROR:    0,
    LOG_WARN:     1,
    LOG_INFO:     2,
    LOG_DEBUG:    3,
    JASMINE_ADAPTER: __dirname + '/../adapter/jasmine.js'
  };

  try {
    vm.runInNewContext(fs.readFileSync(configFilePath), config);
  } catch(e) {
    if (e.name === 'SyntaxError') {
      log.error('Syntax error in config file!');
    } else {
      log.error('Config file does not exist!');
    }

    throw e;
  }


  // resolve basePath
  config.basePath = path.resolve(path.dirname(configFilePath), config.basePath);

  var basePathResolve = function(relativePath) {
    return path.resolve(config.basePath, relativePath);
  };

  config.files = config.files.map(basePathResolve);
  config.exclude = config.exclude.map(basePathResolve);

  return config;
};

// TODO(vojta): move to separate module ?
// TODO(vojta): refactor the deps, probably get the resolving out from this object
var FileGuardian = function(filePatterns, excludePatterns, autoWatch, autoWatchInterval) {
  var files_ = [];

  // TODO(vojta): we should return promise instead of value
  this.getFiles = function() {
    return files_;
  };

  this.checkModifications = function(done) {
    var waiting = 0;
    var modified = 0;

    var finish = function() {
      waiting--;
      if (!waiting && done) done(modified);
    };

    log.debug('Checking files for modifications...');
    files_.forEach(function(file) {
      waiting++;
      fs.stat(file.path, function(err, stat) {
        if (file.mtime < stat.mtime) {
          file.mtime = stat.mtime;
          modified++;
          log.info('Modified: ', file.path);
        }
        finish();
      });
    });
  };

  // resolve patterns into abs paths of existing files
  var self = this;
  var watchOptions = {interval: autoWatchInterval};
  resolve(filePatterns, excludePatterns, function(err, files) {
    files_ = files;

    if (autoWatch) {
      // TODO(vojta): watch creating new files ?
      files.forEach(function(file) {
        log.debug('Watching ', file.path);
        fs.watchFile(file.path, watchOptions, function(current, previous) {
          // TODO(vojta): handle file deleting (current.nlink === 0)
          // TODO(vojta): shouldn't this be async ?
          if (current.mtime > previous.mtime) {
            log.info('Modified: ', file.path);
            file.mtime = current.mtime;
            self.emit('fileModified');
          }
        });
      });
    }
  });
};

// inherit EventEmitter
FileGuardian.prototype = new EventEmitter();


// PUBLIC API
exports.parseConfig = parseConfig;
exports.FileGuardian = FileGuardian;
