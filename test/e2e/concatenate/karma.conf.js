module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    concatenate: true,

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
