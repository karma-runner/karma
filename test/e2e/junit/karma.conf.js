module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    reporters: ['dots', 'junit'],

    logLevel: config.LOG_DEBUG,

    junitReporter: {
      outputFile: 'test-results.xml'
    },

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-junit-reporter'
    ],
  });
};
