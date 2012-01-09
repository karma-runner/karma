/**
 * Unit testing helpers
 */

var vm = require('vm');
var fs = require('fs');
var path = require('path');

/**
 * Helper for unit testing:
 * - load module with mocked dependencies
 * - allow accessing private state of the module
 *
 * @param {string} path Absolute path to module (file to load)
 * @param {Object=} mocks Hash of mocked dependencies
 */
exports.loadFile = function(filePath, mocks) {
  mocks = mocks || {};

  // this is necessary to allow relative path modules within loaded file
  // i.e. requiring ./some inside file /a/b.js needs to be resolved to /a/some
  var resolveModule = function(module) {
    if (module.charAt(0) !== '.') return module;
    return path.resolve(path.dirname(filePath), module);
  };

  var exports = {};
  var context = {
    require: function(name) {
      return mocks[name] || require(resolveModule(name));
    },
    __dirname: path.dirname(filePath),
    __filename: filePath,
    console: console,
    exports: exports,
    module: {
      exports: exports
    }
  };

  vm.runInNewContext(fs.readFileSync(filePath), context);
  return context;
};

// TODO(vojta) add jasmine matchers:
// - toEqualDate
// - toHaveBeenCalledOnce

exports.disableLogger = function() {
  require('../lib/logger').setLevel(-1);
};
