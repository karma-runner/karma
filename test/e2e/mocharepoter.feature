Feature: Mocha reporter
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to use the mocha reporter.

  Scenario: Execute a test in PhantomJS with colors
    Given a configuration with:
      """
      files = ['mocha/plus.js', 'mocha/test.js'];
      browsers = ['PhantomJS'];
      frameworks = ['mocha', 'chai']
      colors = true
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        'karma-mocha-reporter',
        'karma-mocha',
        'karma-chai'
      ];
      reporters = ['mocha'];
      """
    When I start Karma
    Then it passes with like:
      """
      2 tests completed
      """

  Scenario: Execute a test in PhantomJS with no-colors
    Given a configuration with:
      """
      files = ['mocha/plus.js', 'mocha/test.js'];
      browsers = ['PhantomJS'];
      frameworks = ['mocha', 'chai']
      colors = false
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        'karma-mocha-reporter',
        'karma-mocha',
        'karma-chai'
      ];
      reporters = ['mocha'];
      """
    When I start Karma
    Then it passes with like:
      """
      ✔ 2 tests completed
      """