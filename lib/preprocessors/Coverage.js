var istanbul = require('istanbul');
var q        = require('q');

var log      = require('../logger').create('preprocess.coverage');

var instrumenter = new istanbul.Instrumenter({embedSource: true});
var Coverage = function(content) {
  var deferred = q.defer();
  
  log.debug('Processing "%s".', content.file.originalPath);
  var jsPath = content.file.originalPath.replace(content.basePath + '/', './');
  log.debug(content.value.substring(0,20));
  instrumenter.instrument(content.value, jsPath, function(err, instrumentedCode) {
    if(err) {
      log.error('%s\n  at %s', err.message, content.file.originalPath);
      deferred.reject(err);
    }
    content.value = instrumentedCode;
    deferred.resolve(content);
  });
  
  return deferred.promise;
};

//PUBLISH
module.exports = Coverage;
