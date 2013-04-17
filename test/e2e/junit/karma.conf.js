module.exports = function(karma) {
  karma.configure({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    reporters: ['dots', 'junit'],

    logLevel: karma.LOG_DEBUG,

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
