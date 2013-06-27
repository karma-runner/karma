module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.coffee'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    preprocessors: {
      '**/*.coffee': 'coffee'
    },

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-coffee-preprocessor',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
