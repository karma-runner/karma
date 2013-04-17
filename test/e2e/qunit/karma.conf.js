module.exports = function(karma) {
  karma.configure({
    frameworks: ['qunit'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: ['Chrome'],

    reporters: ['dots'],

    plugins: [
      'karma-qunit',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
