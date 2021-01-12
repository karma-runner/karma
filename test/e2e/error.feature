Feature: Error Display
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to log errors

  Scenario: Syntax Error in a test file
    Given a configuration with:
      """
      files = ['error/test.js', 'error/under-test.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it fails with:
      """
      SyntaxError: Unexpected token '}'
      """

  Scenario: Not single-run Syntax Error in a test file
    Given a configuration with:
      """
      files = ['error/test.js', 'error/under-test.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      singleRun = false;
      """
    When I start a server in background
    And I wait until server output contains:
      """
      Executed 2 of 2 (1 FAILED)
      """
    And I run Karma
    Then it fails with like:
      """
      SyntaxError: Unexpected token '}'
      """

Scenario: Missing module Error in a test file
    Given a configuration with:
      """
      files = [{pattern: 'error/import-something-from-somewhere.js', type: 'module'}];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it fails with:
      """
      Uncaught Error loading error/import-something-from-somewhere.js
      """
