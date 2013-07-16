module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: ['sl_chrome_linux'],

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-sauce-launcher'
    ],

    customLaunchers: {
      sl_chrome_linux: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'linux'
      }
    }
  });
};
