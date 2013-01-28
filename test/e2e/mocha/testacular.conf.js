files = [
  MOCHA,
  MOCHA_ADAPTER,
  '*.js'
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;
browsers = ['Chrome'];
singleRun = false;

browsers = ['Chrome'];

plugins = [
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
