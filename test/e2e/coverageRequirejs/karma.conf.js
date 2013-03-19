frameworks = ['mocha', 'requirejs'];

files = [
  'main.js',
  {pattern: '*.js', included: false},
];

exclude = [
  'karma.conf.js'
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
  'karma-mocha',
  'karma-requirejs',
  'karma-coverage',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
