var helper = require('./helper');
var log = require('./logger').create('reporter');
var MultiReporter = require('./reporters/Multi');


var createErrorFormatter = function(basePath, urlRoot) {
  var URL_REGEXP = new RegExp('http:\\/\\/[^\\/]*' + urlRoot.replace(/\//g, '\\/') +
                              '(base|absolute)([^\\?\\s]*)(\\?[0-9]*)?', 'g');

  return function(msg, indentation) {
    // remove domain and timestamp from source files
    // and resolve base path / absolute path urls into absolute path
    msg = msg.replace(URL_REGEXP, function(full, prefix, path) {
      if (prefix === 'base') {
        return basePath + path;
      } else if (prefix === 'absolute') {
        return path;
      }
    });

    // indent every line
    if (indentation) {
      msg = indentation + msg.replace(/\n/g, '\n' + indentation);
    }

    return msg + '\n';
  };
};

var createReporters = function(names, config, injector) {
  var errorFormatter = createErrorFormatter(config.basePath, config.urlRoot);
  var multiReporter = new MultiReporter();

  // TODO(vojta): instantiate all reporters through DI
  names.forEach(function(name) {
    if (['dots', 'progress'].indexOf(name) !== -1) {
      var Cls = require('./reporters/' + helper.ucFirst(name) + (config.colors ? 'Color' : ''));
      return multiReporter.reporters.push(new Cls(errorFormatter, config.reportSlowerThan));
    }

    try {
      multiReporter.reporters.push(injector.get('reporter:' + name));
    } catch(e) {
      log.warn('Reporter "%s" is not registered!', name);
    }
  });

  return multiReporter;
};

createReporters.$inject = ['config.reporters', 'config', 'emitter', 'injector'];


// PUBLISH
exports.createReporters = createReporters;
