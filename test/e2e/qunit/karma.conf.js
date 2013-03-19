frameworks = ['qunit'];

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
  'karma-qunit',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
