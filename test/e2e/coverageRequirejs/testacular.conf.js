frameworks = ['mocha', 'requirejs'];

files = [
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

plugins = [
  'testacular-mocha',
  'testacular-requirejs',
  'testacular-coverage',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
