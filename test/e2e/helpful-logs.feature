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
      WARN \[middleware:karma\]: Unable to determine file type from the file extension, defaulting to js.
        To silence the warning specify a valid type for .+modules/minus.mjs in the configuration file.
        See https://karma-runner.github.io/latest/config/files.html
      """
