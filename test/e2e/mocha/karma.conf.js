frameworks = ['mocha'];

files = [
  '*.js'
];

exclude = [
  'karma.conf.js'
];

autoWatch = true;
browsers = ['Chrome'];
singleRun = false;

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'karma-mocha',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
