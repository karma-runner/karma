frameworks = ['jasmine'];

files = [
  'lib/*.js',
  'test/*.js'
];

autoWatch = true;

browsers = ['Chrome']

reporters = ['progress', 'coverage'];

preprocessors = {
  '**/coverage/lib/*.js': 'coverage'
};

//Code Coverage options. report type available:
//- html (default)
//- lcov (lcov and html)
//- lcovonly
//- text (standard output)
//- text-summary (standard output)
//- cobertura (xml format supported by Jenkins)
coverageReporter = {
    // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
    type : 'html',
    dir : 'coverage/'
};

plugins = [
  'karma-jasmine',
  'karma-coverage',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
