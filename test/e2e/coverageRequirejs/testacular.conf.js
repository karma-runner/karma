files = [
  MOCHA,
  MOCHA_ADAPTER,
  'chai.js',
  REQUIRE,
  REQUIRE_ADAPTER,
  'main.js',
  {pattern: '*.js', included: false},
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;
browsers = ['Chrome'];
singleRun = false;

reporters = ['progress', 'coverage'];

preprocessors = {
  '**/coverageRequirejs/dependency.js': 'coverage'
};

coverageReporter = {
    type : 'html',
    dir : 'coverage/'
};
