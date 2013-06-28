module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // files to load
    files: [
      '*.js'
    ],

    autoWatch: true,
    autoWatchInterval: 1,
    logLevel: config.LOG_INFO,
    logColors: true,

    browsers: ['Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
