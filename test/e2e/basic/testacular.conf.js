frameworks = ['jasmine'];

files = [
  '*.js'
];

exclude = [
  'testacular.conf.js'
];

autoWatch = true;

browsers = ['Chrome'];

plugins = [
  'testacular-jasmine',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
