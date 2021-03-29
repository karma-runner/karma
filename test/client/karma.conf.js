const fs = require('fs')

const TRAVIS_WITH_BS = !!process.env.BROWSER_STACK_ACCESS_KEY

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

// Verify the install. This will run async but that's ok we'll see the log.
fs.lstat('node_modules/karma', (err, stats) => {
  if (err) {
    console.error('Cannot verify installation', err.stack || err)
  }
  if (stats && stats.isSymbolicLink()) {
    return
  }

  console.log('**** Incorrect directory layout for karma self-tests ****')
  console.log(`
    $ npm install

    $ npm run init
    # or if you're on Windows
    $ npm run init:windows

    $ npm run build
  `)
  process.exit(1)
})

let browsers = ['Chrome']

if (process.env.TRAVIS) {
  if (TRAVIS_WITH_BS) {
    browsers = Object.keys(launchers)
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
    browsers: browsers,

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
