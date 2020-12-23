Feature: Helpful warning and errors
  In order to use Karma
  As a person who wants to write great tests
  I want to get messages which help me to fix problems

  Scenario: Karma fails to determine a file type from the file extension
    Given a configuration with:
      """
      files = [ 'modules/**/*.mjs' ];
      browsers = ['ChromeHeadlessNoSandbox'];
      frameworks = ['mocha', 'chai'];
      plugins = [
        'karma-mocha',
        'karma-chai',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then the stdout matches RegExp:
      """
      ERROR \[middleware:karma\]: Invalid file type \(mjs\) for .+modules/minus.mjs\.
      """
