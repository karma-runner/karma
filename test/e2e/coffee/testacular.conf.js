files = [
  JASMINE,
  JASMINE_ADAPTER,
  '*.coffee'
];

exclude = [];

autoWatch = true;

browsers = ['Chrome'];

preprocessors = {
  '**/*.coffee': 'coffee'
};

plugins = [
  'testacular-coffee-preprocessor',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];
