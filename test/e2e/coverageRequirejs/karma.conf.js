module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'requirejs'],

    files: [
      'main.js',
      {pattern: '*.js', included: false},
    ],

    autoWatch: true,
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],
    singleRun: false,

    reporters: ['dots', 'coverage'],

    preprocessors: {
      'dependency.js': 'coverage'
    },

    coverageReporter: {
        type : 'html',
        dir : 'coverage/'
    },

    plugins: [
      'karma-mocha',
      'karma-requirejs',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
