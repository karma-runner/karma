module.exports = function(karma) {
  karma.configure({
    frameworks: ['jasmine'],

    // files to load
    files: [
      '*.js'
    ],

    autoWatch: true,
    autoWatchInterval: 1,
    logLevel: karma.LOG_INFO,
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
