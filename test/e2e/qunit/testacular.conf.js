frameworks = ['qunit'];

files = [
  '*.js'
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;

browsers = ['Chrome']

plugins = [
  'testacular-qunit',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
