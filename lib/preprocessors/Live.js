var live = require('LiveScript');
var q    = require('q');

var log  = require('../logger').create('preprocess.ls');

var Live = function(content, file, basePath, done) {
  var deferred = q.defer();
  
  log.debug('Processing "%s".', content.file.originalPath);
  content.file.path = content.file.originalPath + '-compiled.js';

  var processed = null;
  try {
    content.value = live.compile(content.value, {bare: true});
    deferred.resolve(content);
  } catch (e) {
    log.error('%s\n  at %s', e.message, file.originalPath);
    deferred.reject(e);
  }
  
  return deferred.promise;
};

// PUBLISH
module.exports = Live;
