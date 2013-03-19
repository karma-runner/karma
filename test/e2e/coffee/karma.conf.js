frameworks = ['jasmine'];

files = [
  '*.coffee'
];

exclude = [];

autoWatch = true;

browsers = ['Chrome'];

preprocessors = {
  '**/*.coffee': 'coffee'
};

reporters = ['dots'];

plugins = [
  'karma-jasmine',
  'karma-coffee-preprocessor',
  'karma-chrome-launcher',
  'karma-firefox-launcher'
];
