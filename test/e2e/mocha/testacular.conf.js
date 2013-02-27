frameworks = ['mocha'];

files = [
  '*.js'
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;
browsers = ['Chrome'];
singleRun = false;

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'testacular-mocha',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
