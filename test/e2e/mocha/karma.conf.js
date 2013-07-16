module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ],

    autoWatch: true,
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],
    singleRun: false,

    browsers: ['Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
