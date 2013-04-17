module.exports = function(karma) {
  karma.configure({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ],

    autoWatch: true,
    browsers: ['Chrome'],
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
