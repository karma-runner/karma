var mm = require('minimatch');
var log = require('./logger').create('preprocessor');
var coffee = require('coffee-script');
var fs = require('fs');
var crypto = require('crypto');

var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};


var processCoffee = function(content, file, done) {
  log.debug('Processing %s [coffee]', file.originalPath);

  file.contentPath = file.contentPath + '.js';
  file.path = file.originalPath + '-compiled.js';

  done(coffee.compile(content, {bare: true}));
};

var processors = {
  coffee: processCoffee
};



var createPreprocessor = function(config) {
  var patterns = Object.keys(config);

  return function(file, done) {
    // TODO(vojta): chain multiple pre-processors for a single file
    var processor;

    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {

        if (processors.hasOwnProperty(config[patterns[i]])) {
          processor = processors[config[patterns[i]]];
          break;
        } else {
          log.warn('Pre-processor "%s" is not registered!');
        }
      }
    }

    if (processor) {
      return fs.readFile(file.originalPath, function(err, buffer) {
        file.contentPath = process.env.TMPDIR + sha1(file.originalPath);
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

exports.createPreprocessor = createPreprocessor;
