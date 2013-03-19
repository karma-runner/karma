require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // load test.js
  deps: ['test'],

  // we have to kick of jasmine, as it is asynchronous
  callback: window.__karma__.start
});
