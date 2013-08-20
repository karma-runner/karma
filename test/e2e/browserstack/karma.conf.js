var TRAVIS_WITHOUT_BS = process.env.TRAVIS_SECURE_ENV_VARS === 'false';

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    files: [
      '*.js'
    ],

    autoWatch: true,

    browsers: TRAVIS_WITHOUT_BS ? ['Firefox'] : ['bs_ff_mac', 'bs_ch_mac'],

    reporters: ['dots'],

    browserStack: {
      username: 'vojta.jina@gmail.com',
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    },

    customLaunchers: {
      bs_ff_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: 'latest',
        os: 'Windows',
        os_version: 'XP'
      },
      bs_ch_mac: {
        base: 'BrowserStack',
        browser: 'chrome',
        browser_version: 'latest',
        os: 'OS X',
        os_version: 'Lion'
      }
    },

    plugins: [
      'karma-jasmine',
      'karma-firefox-launcher',
      'karma-browserstack-launcher'
    ]
  });
};
