frameworks = ['jasmine'];

files = [
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

plugins = [
  'testacular-jasmine',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher',
  'testacular-junit-reporter'
];
