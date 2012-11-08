var util = require('util');
var q    = require('q');

var log  = require('../logger').create('preprocess.html2js');


var template = "angular.module('%s', []).run(function($templateCache) {\n" +
    "  $templateCache.put('%s',\n    '%s');\n" +
    "});\n";

var escapeContent = function(content) {
  return content.replace(/'/g, "\\'").replace(/\n/g, "' +\n    '");
};

var Html2Js = function(content) {
  var deferred = q.defer();
  log.debug('Processing "%s".', content.file.originalPath);

  var htmlPath = content.file.originalPath.replace(content.basePath + '/', '');

  content.file.path = content.file.path + '.js';
  content.value = util.format(template, htmlPath, htmlPath, escapeContent(content));
  deferred.resolve(content);
  
  return deferred.promise;
};

// PUBLISH
module.exports = Html2Js;
