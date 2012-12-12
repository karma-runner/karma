require.config({
  // example of using shim, to load non AMD libraries (such as Backbone, jquery)
  shim: {
    '/base/shim.js': {
      exports: 'global'
    }
  }
});

