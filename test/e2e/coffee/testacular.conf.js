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

reporters = ['dots'];