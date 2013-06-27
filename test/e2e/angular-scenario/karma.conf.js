module.exports = function(config) {
  config.set({
    frameworks: ['ng-scenario'],

    files: [
      'e2eSpec.js'
    ],

    urlRoot: '/__karma/',

    autoWatch: true,

    proxies: {
      '/': 'http://localhost:8000/test/e2e/angular-scenario/'
    },

    browsers: ['Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-ng-scenario',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ]
  });
};
