module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js',
      '*.html'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-html2js-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
