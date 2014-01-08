module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    reporters: ['dots', 'junit'],

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
