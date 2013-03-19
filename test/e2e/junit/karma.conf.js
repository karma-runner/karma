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
  'karma-jasmine',
  'karma-chrome-launcher',
  'karma-firefox-launcher',
  'karma-junit-reporter'
];
