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

var createReporters = function(names, config, emitter) {
  var errorFormatter = createErrorFormatter(config.basePath, config.urlRoot);
  var multiReporter = new MultiReporter();

  names.forEach(function(name) {
    log.debug('Using reporter "%s".', name);

    if (name === 'junit') {
      return multiReporter.reporters.push(new exports.JUnit(errorFormatter,
          config.junitReporter.outputFile, config.junitReporter.suite, emitter));
    }
    if (name === 'coverage') {
      return multiReporter.reporters.push(new exports.Coverage(config, emitter));
    }
    if (name === 'growl') {
      return multiReporter.reporters.push(new exports.Growl(config));
    }

    var Reporter = exports[helper.ucFirst(name) + (config.colors ? 'Color' : '')];
    if (Reporter) {
      var reporter = new Reporter(errorFormatter, config.reportSlowerThan);
      return multiReporter.reporters.push(reporter);
    }

    log.error('Reporter "%s" does not exist!', name);
  });

  return multiReporter;
};


// PUBLISH
exports.Dots = require('./reporters/Dots');
exports.Progress = require('./reporters/Progress');
exports.DotsColor = require('./reporters/DotsColor');
exports.ProgressColor = require('./reporters/ProgressColor');
exports.JUnit = require('./reporters/JUnit');
exports.Coverage = require('./reporters/Coverage');
exports.Teamcity = exports.TeamcityColor = require('./reporters/Teamcity');
exports.Growl = require('./reporters/Growl');

exports.createReporters = createReporters;
