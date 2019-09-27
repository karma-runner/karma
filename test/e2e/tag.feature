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
  @not-jenkins
  Scenario: Execute a test in Chrome with version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-with-version.js'];
      browsers = ['Chrome'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
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
    Then it passes with like:
      """
      .
      Firefox
      """
  @not-jenkins
  Scenario: Execute a test in Chrome without version, without JavaScript tag
    Given a configuration with:
      """
      files = ['tag/tag.js', 'tag/test-without-version.js'];
      browsers = ['Chrome'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      Chrome
      """
