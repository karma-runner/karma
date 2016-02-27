Feature: JavaScript Tag
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to run tests from the command line.

  Scenario: Execute a test in Firefox with version, with JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test.js'];
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
      .
      Firefox
      """

  Scenario: Execute a test in Chrome with version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test.js'];
      browsers = ['Chrome'];
      jsVersion = 1.8;
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it passes with:
      """
      .
      Chrome
      """
      