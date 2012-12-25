var util = require('util');

var log = require('../logger').create('preprocess.html2js');


var template = 'angular.module(\'%s\', []).run(function($templateCache) {\n' +
    '  $templateCache.put(\'%s\',\n    \'%s\');\n' +
    '});\n';

var escapeContent = function(content) {
  return content.replace(/'/g, '\\\'').replace(/\n/g, '\\n\' +\n    \'');
};

var Html2js = function(content, file, basePath, done) {
  log.debug('Processing "%s".', file.originalPath);

  var htmlPath = file.originalPath.replace(basePath + '/', '');

  file.path = file.path + '.js';
  done(util.format(template, htmlPath, htmlPath, escapeContent(content)));
};

// PUBLISH
module.exports = Html2js;
