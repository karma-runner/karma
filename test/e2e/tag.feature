Feature: JavaScript Tag
  In order to use Karma
  As a person who wants to write great tests
  I want to add a JavaScript version tag in Firefox only.

  Scenario: Execute a test in Firefox with version, with JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-with-version.js'];
      browsers = ['Firefox']
      plugins = [
        'karma-jasmine',
        'karma-firefox-launcher'
      ]
      """
    When I start Karma
    Then it passes with like:
      """
      .
      Firefox
      """

  Scenario: Execute a test in ChromeHeadless with version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-with-version.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
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

  Scenario: Execute a test in Firefox without version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-without-version.js'];
      browsers = ['Firefox']
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

  Scenario: Execute a test in ChromeHeadless without version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-without-version.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
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
