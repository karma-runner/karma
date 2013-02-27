frameworks = ['jasmine'];

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
  'testacular-jasmine',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
