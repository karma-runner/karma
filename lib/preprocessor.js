var fs = require('fs');
var crypto = require('crypto');
var util = require('util');
var mm = require('minimatch');
var path = require('path');

var helper = require('./helper');
var log = require('./logger').create('preprocess');


var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};


var createPreprocessor = function(config, basePath) {
  var patterns = Object.keys(config);

  return function(file, done) {
    // TODO(vojta): chain multiple pre-processors for a single file
    var processor;

    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {
        var processorName = config[patterns[i]];

        if (typeof processorName === 'function') {
          processor = function(content, file, basePath, done) {
            try {
              processorName(content, file, function (result) {
                var ext = result.ext || 'js';
                file.path = file.path + '.' + ext;
                done(result.content);
              });
            } catch (error) {
              log.error('%s\n  at %s', error.message, file.originalPath);
              done();
            }
          };
        } else {
          processor = exports[helper.ucFirst(processorName)];
        }

        if (processor) {
          break;
        } else {
          log.warn('Pre-processor "%s" is not registered!', processorName);
        }
      }
    }

    if (processor) {
      return fs.readFile(file.originalPath, function(err, buffer) {
        // TODO(vojta): extract get/create temp dir somewhere else (use the same for launchers etc)
        var env = process.env;
        file.contentPath = path.resolve((env.TMPDIR || env.TMP || env.TEMP || '/tmp'), sha1(file.originalPath) + '.js');

        processor(buffer.toString(), file, basePath, function(processed) {
          fs.writeFile(file.contentPath, processed, function(err) {
            done();
          });
        });
      });
    }

    return process.nextTick(done);
  };
};

// Publish
exports.Live = require('./preprocessors/Live');
exports.Coffee = require('./preprocessors/Coffee');
exports.Html2js = require('./preprocessors/Html2js');
exports.Coverage = require('./preprocessors/Coverage');

exports.createPreprocessor = createPreprocessor;
