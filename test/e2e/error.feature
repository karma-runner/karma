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
      SyntaxError: Unexpected token }
      """
  Scenario: Single-run Syntax Error in a test file
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
    When I monitor Karma
    And I stop when the log contains 'SyntaxError'
    Then it fails with like:
      """
      SyntaxError: Unexpected token }
      """
    And I stop a server programmatically
