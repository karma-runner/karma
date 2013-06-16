var fs = require('graceful-fs');
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
    var preprocessors = [];
    var nextPreprocessor = function(content) {
      if (!preprocessors.length) {
        return fs.writeFile(file.contentPath, content, function() {
          done();
        });
      }

      var preprocessor = preprocessors.shift();
      preprocessor.pp(content, file, nextPreprocessor, preprocessor.options || {});
    };
    var instantiatePreprocessor = function(preprocessor) {
      if (!preprocessor.name) {
        preprocessor = {name: preprocessor};
      }

      try {
        preprocessor.pp = injector.get('preprocessor:' + preprocessor.name);
        preprocessors.push(preprocessor);
      } catch (e) {
        // TODO(vojta): log warning only once per each preprocessor
        log.warn('Pre-processor "%s" is not registered!', preprocessor.name);
      }
    };

    // collects matching preprocessors
    // TODO(vojta): should we cache this ?
    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {
        config[patterns[i]].forEach(instantiatePreprocessor);
      }
    }

    if (preprocessors.length) {
      return fs.readFile(file.originalPath, function(err, buffer) {
        // TODO(vojta): extract get/create temp dir somewhere else (use the same for launchers etc)
        var env = process.env;
        var tmp = env.TMPDIR || env.TMP || env.TEMP || '/tmp';
        file.contentPath = tmp + '/'  + sha1(file.originalPath) + '.js';

        nextPreprocessor(buffer.toString());
      });
    }

    return process.nextTick(done);
  };
};
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector'];

exports.createPreprocessor = createPreprocessor;
