// When running pre-release tests we want tests to fail if BrowserStack is not
// configured instead of falling back to the headless browser. That's what
// KARMA_TEST_NO_FALLBACK variable controls.
const useBrowserStack = (process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY) ||
  process.env.KARMA_TEST_NO_FALLBACK

console.log(`ENV: ${process.env}.`)

const launchers = {
  bs_chrome: {
    base: 'BrowserStack',
    browser: 'chrome',
    os: 'Windows',
    os_version: '10'
  },
  bs_firefox: {
    base: 'BrowserStack',
    browser: 'firefox',
    os: 'Windows',
    os_version: '10'
  },
  bs_safari: {
    base: 'BrowserStack',
    browser: 'Safari',
    os: 'OS X',
    os_version: 'Big Sur'
  },
  bs_ie: {
    base: 'BrowserStack',
    browser: 'IE',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '10'
  },
  bs_ie9: {
    base: 'BrowserStack',
    browser: 'IE',
    browser_version: '9.0',
    os: 'Windows',
    os_version: '7'
  }
}

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../..',

    frameworks: ['browserify', 'mocha'],

    // list of files / patterns to load in the browser
    files: [
      'test/client/*.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    preprocessors: {
      'test/client/*.js': ['browserify']
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['dots'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'test-results.xml'
    },

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: useBrowserStack ? Object.keys(launchers) : ['ChromeHeadless'],

    customLaunchers: launchers,

    // Recommeneded browserstack timeouts
    // https://github.com/karma-runner/karma-browserstack-launcher/issues/61
    captureTimeout: 3e5,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 3e5,
    browserSocketTimeout: 1.2e5,
    browserNoActivityTimeout: 3e5,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-junit-reporter',
      'karma-browserify',
      'karma-browserstack-launcher'
    ],

    concurrency: 3,

    forceJSONP: true,

    browserStack: {
      project: 'Karma',
      // The karma-browserstack-launcher polls for each browser.
      // With many browsers the 120 requests per minute limit is hit
      // resulting in fails Error: 403 Forbidden (Rate Limit Exceeded)
      pollingTimeout: 10000
    }
  })
}
