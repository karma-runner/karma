var allTestFiles = [];
var TEST_REGEXP = /test/;

Object.keys(window.__testacular__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  // Testacular serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // example of using shim, to load non AMD libraries (such as Backbone, jquery)
  shim: {
    '/base/shim.js': {
      exports: 'global'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kick of jasmine, as it is asynchronous
  callback: window.__testacular__.start
});
