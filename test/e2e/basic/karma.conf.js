frameworks = ['jasmine'];

files = [
  '*.js'
];

exclude = [
  'karma.conf.js'
];

autoWatch = true;

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'karma-jasmine',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
