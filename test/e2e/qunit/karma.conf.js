module.exports = function(config) {
  config.set({
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
