/**
 * Unit testing helpers
 */

var vm = require('vm');
var fs = require('fs');

/**
 * Helper for unit testing:
 * - load module with mocked dependencies
 * - allow accessing private state of the module
 *
 * @param {string} path Absolute path to module (file to load)
 * @param {Object=} mocks Hash of mocked dependencies
 */
exports.loadFile = function(path, mocks) {
  mocks = mocks || {};

  var exports = {};
  var context = {
    require: function(name) {
      return mocks[name] || require(name);
    },
    console: console,
    exports: exports,
    module: {
      exports: exports
    }
  };

  vm.runInNewContext(fs.readFileSync(path), context);
  return context;
};

// TODO(vojta) add jasmine matchers:
// - toEqualDate
// - toHaveBeenCalledOnce

beforeEach(function() {
  // disable logging during testing
  require('../lib/logger').setLevel(-1);
});
