// parse the configuration
var fs = require('fs');
var path = require('path');
var vm = require('vm');

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
  // + normalize parts - remove empty element 
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
    if (!waiting) return done(null, results);
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
 * - absolute path
 * - sorted ???
 *
 * @param {Array.<string>} patterns Array of patterns
 * @param {string} base Base path to resolve all patterns to
 * @param {function(err, files)} done Callback
 */
var resolve = function(patterns, done) {
  var results = [];
  var waiting = 0;

  patterns.forEach(function(pattern) {
    waiting++;

    resolveSinglePattern(pattern, function(err, files) {
      results = results.concat(files);
      waiting--;
      if (!waiting) {
        var uniquePaths = [],
            uniqueResults = [];
        results.forEach(function(file) {
          if (uniquePaths.indexOf(file.path) === -1) {
            uniquePaths.push(file.path);
            uniqueResults.push(file);
          }
        });
        done(null, uniqueResults);
      }
    });
  });
};


var parseConfig = function(configFilePath) {
  // default configuration
  var config = {
    port: 8080,
    runnerPort: 1337,
    basePath: '',
    files: []
  };

  // TODO(vojta): handle non-existing config file
  // TODO(vojta): handle invalid config file
  vm.runInNewContext(fs.readFileSync(configFilePath), config);

  // resolve basePath
  config.basePath = path.resolve(path.dirname(configFilePath), config.basePath);

  // resolve all files to abs path
  config.files.forEach(function(filePath, i) {
    config.files[i] = path.resolve(config.basePath, filePath);
  });

  return config;
};


var FileGuardian = function(filePatterns) {
  var files_ = [];

  this.getFiles = function() {
    return files_;
  };

  this.checkModifications = function() {
    files_.forEach(function(file) {
      fs.stat(file.path, function(err, stat) {
        if (file.mtime < stat.mtime) {
          console.log('FILE ' + file + ' HAS CHANGED !');
          file.mtime = stat.mtime;
        }
      });
    });
  };

  // resolve patterns into abs paths of existing files
  resolve(filePatterns, function(err, files) {
    files_ = files;
  });
};


// PUBLIC API
exports.parseConfig = parseConfig;
exports.FileGuardian = FileGuardian;
