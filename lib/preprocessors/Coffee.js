var coffee = require('coffee-script');
var log = require('../logger').create('preprocess.coffee');

var Coffee = function(content, file, basePath, done) {
  log.debug('Processing "%s".', file.originalPath);
  file.path = file.originalPath + '-compiled.js';

  var processed = null;
  try {
    processed = coffee.compile(content, {bare: true});
  } catch (e) {
    log.error('%s\n  at %s', e.message, file.originalPath);
  }

  done(processed);
};

// PUBLISH
module.exports = Coffee;
