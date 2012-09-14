var glob = require('glob');
var mm = require('minimatch');
var fs = require('fs');
var util = require('./util');
var log = require('./logger').create('watcher');


var createWinGlob = function(realGlob) {
  return function(pattern, options, done) {
    var drive = pattern.substr(0, 3);
    options = util.merge(options, { cwd: drive });
    realGlob(pattern.substr(3), options, function(err, results) {
      done(err, results.map(function(path) {
        return drive + path;
      }));
    });
  };
};

if (process.platform === 'win32') {
  glob = createWinGlob(glob);
}


var File = function(path, mtime) {
  this.path = path;
  this.mtime = mtime;
  this.isUrl = false;
};

var Url = function(path) {
  this.path = path;
  this.isUrl = true;
};

Url.prototype.toString = File.prototype.toString = function() {
  return this.path;
};


var GLOB_OPTS = {
  // globDebug: true,
  cwd: '/'
};


var List = function(patterns, excludes, emitter) {
  var self = this;

  // re-glob all the patterns
  this.refresh = function(done) {
    var buckets = this.buckets = new Array(patterns.length);

    var complete = function() {
      log.debug('Resolved files:\n\t' + self.getFiles().join('\n\t'));

      buckets.forEach(function(bucket, i) {
        if (!bucket.length) {
          log.warn('Pattern "%s" does not match any file.', patterns[i]);
        }
      });

      if (done) {
        done();
      }
    };

    // TODO(vojta): use some async helper library for this
    var pending = 0;
    var finish = function() {
      pending--;

      if (!pending) {
        complete();
      }
    };

    patterns.forEach(function(pattern, i) {
      if (util.isUrlAbsolute(pattern)) {
        buckets[i] = [new Url(pattern)];
        return;
      }

      pending++;
      glob(pattern, GLOB_OPTS, function(err, resolvedFiles) {
        buckets[i] = [];

        // stat each file to get mtime and isDirectory
        resolvedFiles.forEach(function(path) {
          var matchExclude = function(excludePattern) {
            return mm(path, excludePattern);
          };

          if (excludes.some(matchExclude)) {
            log.debug('Excluded file "%s"', path);
            return;
          }

          pending++;
          fs.stat(path, function(error, stat) {
            if (!stat.isDirectory()) {
              buckets[i].push(new File(path, stat.mtime));
            }

            finish();
          });
        });
        finish();
      });
    });

    if (!pending) {
      process.nextTick(complete);
    }
  };


  // set new patterns and excludes
  // and re-glob
  this.reload = function(newPatterns, newExcludes, done) {
    patterns = newPatterns;
    excludes = newExcludes;

    this.refresh(done);
  };


  // get flat array of files
  this.getFiles = function() {
    var files = [];
    var uniqueMap = {};

    var byPath = function(a, b) {
      return a.path > b.path;
    };

    this.buckets.forEach(function(bucket) {
      bucket.sort(byPath).forEach(function(file) {
        if (!uniqueMap[file.path]) {
          files.push(file);
          uniqueMap[file.path] = true;
        }
      });
    });

    return files;
  };


  /**
   * Adds a new file into the list (called by watcher)
   *  - ignore excluded files
   *  - ignore files that are already in the list
   *  - get mtime (by stat)
   *  - fires "file_list_modified"
   */
  this.addFile = function(path, done) {
    var buckets = this.buckets;
    var i, j;

    // sorry, this callback is just for easier testing
    done = done || function() {};

    // check excludes
    for (i = 0; i < excludes.length; i++) {
      if (mm(path, excludes[i])) {
        log.debug('Add file "%s" ignored. Excluded by "%s".', path, excludes[i]);
        return done();
      }
    }

    for (i = 0; i < patterns.length; i++) {
      if (mm(path, patterns[i])) {
        for (j = 0; j < buckets[i].length; j++) {
          if (buckets[i][j].path === path) {
            log.debug('Add file "%s" ignored. Already in the list.', path);
            return done();
          }
        }

        break;
      }
    }

    if (!patterns[i]) {
      log.debug('Add file "%s" ignored. Does not match any pattern.', path);
      return done();
    }

    return fs.stat(path, function(err, stat) {
      // in the case someone refresh() the list before stat callback
      if (self.buckets === buckets) {
        buckets[i].push(new File(path, stat.mtime));
        log.info('Added file "%s".', path);
        emitter.emit('file_list_modified', self);
      }

      return done();
    });
  };


  /**
   * Update mtime of a file (called by watcher)
   *  - ignore if file is not in the list
   *  - ignore if mtime has not changed
   *  - fire "file_list_modified"
   */
  this.changeFile = function(path, done) {
    var buckets = this.buckets;
    var i, j;

    // sorry, this callback is just for easier testing
    done = done || function() {};

    outer: for (i = 0; i < buckets.length; i++) {
      for (j = 0; j < buckets[i].length; j++) {
        if (buckets[i][j].path === path) {
          break outer;
        }
      }
    }

    if (!buckets[i]) {
      log.debug('Changed file "%s" ignored. Does not match any file in the list.', path);
      return done();
    }

    return fs.stat(path, function(err, stat) {
      // https://github.com/paulmillr/chokidar/issues/11
      if (err || !stat) {
        return self.removeFile(path, done);
      }

      if (self.buckets === buckets && stat.mtime > buckets[i][j].mtime) {
        buckets[i][j].mtime = stat.mtime;
        log.info('Changed file "%s".', path);
        emitter.emit('file_list_modified', self);
      }

      return done();
    });
  };


  /**
   * Remove a file from the list (called by watcher)
   *  - ignore if file is not in the list
   *  - fire "file_list_modified"
   */
  this.removeFile = function(path, done) {
    var buckets = this.buckets;

    // sorry, this callback is just for easier testing
    done = done || function() {};

    for (var i = 0; i < buckets.length; i++) {
      for (var j = 0; j < buckets[i].length; j++) {
        if (buckets[i][j].path === path) {
          buckets[i].splice(j, 1);
          log.info('Removed file "%s".', path);
          emitter.emit('file_list_modified', self);
          return done();
        }
      }
    }

    log.debug('Removed file "%s" ignored. Does not match any file in the list.', path);
    return done();
  };
};

// PUBLIC
exports.List = List;
