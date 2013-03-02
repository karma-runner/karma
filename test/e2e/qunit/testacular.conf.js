frameworks = ['qunit'];

files = [
  '*.js'
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'testacular-qunit',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
