var mm     = require('minimatch');
var fs     = require('fs');
var crypto = require('crypto');
var util   = require('util');
var q      = require('q');

var helper = require('./helper');
var _      = helper._;
var log    = require('./logger').create('preprocess');


var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};


var createPreprocessor = function(config, basePath) {

  return function(file) {
    var deferred = q.defer();
    var processors = [];
    
    // iterate through the configuration
    _(config).forEach(function(list, pattern){
      // if there is a match with the file we continue our work
      if(mm(file.originalPath, pattern)) {
        log.debug('Resolving %s', file)
        // concate the list items to the processors array
        processors = processors.concat(list);
      }
    });

    if (processors.length > 0) {
      // upcase all processors
      processors = _(processors).map(helper.ucFirst);
      // replace the strings with their preprocessors
      processors = _(processors).map(function(processorName){
        var processor = exports[processorName];
        if(processor) {
          return processor;
        } else {
          log.warn('Pre-processor "%s" is not registered!', processorName);
        }
      });
      
      log.debug('Executing the following preprocessors %s', processors);
      
      fs.readFile(file.originalPath, function(error, buffer){
        // TODO(vojta): extract get/create temp dir somewhere else (use the same for launchers etc)
        var env = process.env;
        file.contentPath = (env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/'  + sha1(file.originalPath) + '.js';
        
        var content = {
          value: buffer.toString(),
          file: file,
          basePath: basePath
        };
        
        // handle all processors in sequence using reduce and q promises
        processors.reduce(function(content, processor) {
          return content.then(processor);
        }, q.resolve(content))
        .then(function(content){
          log.debug('Writing %s', content.file.contentPath);
          return q.ncall(fs.writeFile, fs, content.file.contentPath, content.value)
        })
        .then(deferred.resolve)
        .fail(function(error){
          log.error(error);
          deferred.reject(error);
        });
        
      });
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  };
};

// Publish
exports.Live = require('./preprocessors/Live');
exports.Coffee = require('./preprocessors/Coffee');
exports.Html2Js = require('./preprocessors/Html2Js');
exports.Coverage = require('./preprocessors/Coverage');

exports.createPreprocessor = createPreprocessor;
