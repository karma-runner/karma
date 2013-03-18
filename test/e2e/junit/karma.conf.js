files = [
  JASMINE,
  JASMINE_ADAPTER,
  '*.js'
];

exclude = [
  'karma.conf.js'
];

autoWatch = true;

browsers = ['Chrome']

reporters = ['dots', 'junit'];

logLevel = LOG_DEBUG;

junitReporter = {
  outputFile: 'test-results.xml'
};

