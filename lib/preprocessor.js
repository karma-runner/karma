var mm = require('minimatch');
var coffee = require('coffee-script');
var fs = require('fs');
var crypto = require('crypto');
var util = require('util');

var logger = require('./logger');
var log = logger.create('preprocess');
var logCoffee = logger.create('preprocess.coffee');
var logHtml2Js = logger.create('preprocess.html2js');

var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};


// TODO(vojta): split into preprocessors/*.js
var processCoffee = function(content, file, basePath, done) {
  logCoffee.debug('Processing "%s".', file.originalPath);
  file.path = file.originalPath + '-compiled.js';

  var processed = null;
  try {
    processed = coffee.compile(content, {bare: true});
  } catch (e) {
    logCoffee.error('%s\n  at %s', e.message, file.originalPath);
  }

  done(processed);
};


var TPL = "angular.module('%s', []).run(function($templateCache) {\n" +
    "  $templateCache.put('%s',\n    '%s');\n" +
    "});\n";

var escapeContent = function(content) {
  return content.replace(/'/g, "\\'").replace(/\n/g, "' +\n    '");
};

var processHtml2Js = function(content, file, basePath, done) {
  logHtml2Js.debug('Processing "%s".', file.originalPath);

  var htmlPath = file.originalPath.replace(basePath + '/', '');

  file.path = file.path + '.js';
  done(util.format(TPL, htmlPath, htmlPath, escapeContent(content)));
};

var processors = {
  coffee: processCoffee,
  html2js: processHtml2Js
};


var createPreprocessor = function(config, basePath) {
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
        // TODO(vojta): extract get/create temp dir somewhere else (use the same for launchers etc)
        var env = process.env;
        file.contentPath = (env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/'  + sha1(file.originalPath) + '.js';

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

exports.createPreprocessor = createPreprocessor;
