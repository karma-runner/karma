require.config({
  // example of using shim, to load non AMD libraries (such as Backbone, jquery)
  shim: {
    '/base/shim.js': {
      exports: 'global'
    }
  }
});

// bootstrap - require, once loaded, kick off test run
require(['test', '/base/shim.js'], function(test, shim) {
  window.__testacular__.start();
  console.log('shim.js:', shim);
});
