var fs = require('fs');
var crypto = require('crypto');
var mm = require('minimatch');

var log = require('./logger').create('preprocess');


var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};


var createPreprocessor = function(config, basePath, injector) {
  var patterns = Object.keys(config);

  return function(file, done) {
    // TODO(vojta): chain multiple pre-processors for a single file
    var processor;

    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {
        try {
          processor = injector.get('preprocessor:' + config[patterns[i]]);
          break;
        } catch (e) {
          // TODO(vojta): log warning only once per each preprocessor
          log.warn('Pre-processor "%s" is not registered!', config[patterns[i]]);
        }
      }
    }

    if (processor) {
      return fs.readFile(file.originalPath, function(err, buffer) {
        // TODO(vojta): extract get/create temp dir somewhere else (use the same for launchers etc)
        var env = process.env;
        file.contentPath = (env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/'  + sha1(file.originalPath) + '.js';

        processor(buffer.toString(), file, function(processed) {
          fs.writeFile(file.contentPath, processed, function(err) {
            done();
          });
        });
      });
    }

    return process.nextTick(done);
  };
};
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector'];

exports.createPreprocessor = createPreprocessor;
