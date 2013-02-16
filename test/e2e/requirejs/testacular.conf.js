// Testacular configuration
// Generated on Thu Jul 26 2012 14:35:23 GMT-0700 (PDT)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,

  'main.js',

  // all the sources, tests
  {pattern: '*.js', included: false}
];


// list of files to exclude
exclude = [
  'testacular.conf.js'
];


// test results reporter to use
// possible values: dots || progress
reporter = 'dots';


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = [];


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
