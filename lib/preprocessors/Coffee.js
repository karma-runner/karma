var coffee = require('coffee-script');
var q      = require('q');

var log    = require('../logger').create('preprocess.coffee');

var Coffee = function(content) {
  var deferred = q.defer();

  log.debug('Processing "%s".', content.file.originalPath);
  content.file.path = content.file.originalPath + '-compiled.js';
  try {
    content.value = coffee.compile(content.value, {bare: true});
    deferred.resolve(content);
  } catch (e) {
    log.error('%s\n  at %s', e.message, options.file.originalPath);
    deferred.reject(e);
  }

  return deferred.promise;

};

// PUBLISH
module.exports = Coffee;
