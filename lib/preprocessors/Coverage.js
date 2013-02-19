var istanbul = require('istanbul');

var log = require('../logger').create('preprocess.coverage');

var instrumenter = new istanbul.Instrumenter();
var Coverage = function(content, file, basePath, done) {
  log.debug('Processing "%s".', file.originalPath);
  var jsPath = file.originalPath.replace(basePath + '/', './');
  instrumenter.instrument(content, jsPath, function(err, instrumentedCode) {
    if(err) {
      log.error('%s\n  at %s', err.message, file.originalPath);
    }
    done(instrumentedCode);
  });
};

//PUBLISH
module.exports = Coverage;
