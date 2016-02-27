Feature: JavaScript Tag
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to run tests from the command line.

  Scenario: Execute a test in PhantomJs with version, without JavaScript tag
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      jsVersion = 1.8;
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with:
      """
      ..
      PhantomJS
      """

  Scenario: Execute a test in Firefox with version, with JavaScript tag
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js']
      browsers = ['Firefox']
      jsVersion = 1.8
      plugins = [
        'karma-jasmine',
        'karma-firefox-launcher'
      ]
      """
    When I start Karma
    Then it passes with:
      """
      ..
      Firefox
      """