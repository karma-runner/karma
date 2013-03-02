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
  'testacular-jasmine',
  'testacular-coffee-preprocessor',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
