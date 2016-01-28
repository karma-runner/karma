Feature: Error Display
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to log errors

  Scenario: Syntax Error in a test file
    Given a configuration with:
      """
      files = ['error/test.js', 'error/under-test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it fails with:
      """
      SyntaxError: Parser error
      """
