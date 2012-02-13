/**
 * Unit testing helpers
 */

// TODO(vojta) add jasmine matchers:
// - toEqualDate
// - toHaveBeenCalledOnce

exports.disableLogger = function() {
  require('../lib/logger').setLevel(-1);
};
