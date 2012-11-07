files = [
  JASMINE,
  JASMINE_ADAPTER,
  'lib/*.js',
  'test/*.js'
];

exclude = [
  'testacular.conf.js'
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
coverageReporter = {
    // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
    type : 'html',
    dir : 'coverage/'
};