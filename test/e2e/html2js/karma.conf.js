module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js',
      '*.html'
    ],

    preprocessors: {
      '*.html': ['html2js']
    },

    autoWatch: true,

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-html2js-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
