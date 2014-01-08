module.exports = function(config) {
  config.set({
    frameworks: ['qunit'],

    files: [
      'lib/*.js',
      'test/*.js'
    ],

    autoWatch: true,

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    reporters: ['dots', 'coverage'],

    preprocessors: {
      'lib/*.js': 'coverage'
    },

    //Code Coverage options. report type available:
    //- html (default)
    //- lcov (lcov and html)
    //- lcovonly
    //- text (standard output)
    //- text-summary (standard output)
    //- cobertura (xml format supported by Jenkins)
    coverageReporter: {
        // cf. http://gotwarlost.github.io/istanbul/public/apidocs/
        type : 'html',
        dir : 'coverage/'
    },

    plugins: [
      'karma-qunit',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
  });
};
