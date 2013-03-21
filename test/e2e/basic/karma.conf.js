frameworks = ['jasmine'];

files = [
  '*.js'
];

autoWatch = true;

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'karma-jasmine',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
