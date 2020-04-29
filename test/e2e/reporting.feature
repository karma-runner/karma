Feature: Results reporting
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to report test results in the same order as they are executed.

  Scenario: Results appear as tests are executed
    Given a configuration with:
      """
      files = ['reporting/test.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-mocha',
        'karma-mocha-reporter',
        'karma-chrome-launcher'
      ];
      frameworks = ['mocha']
      reporters = ['mocha']
      """
    When I start Karma
    Then it passes with like:
    """
    START:
      Reporting order
        ✔ sync test
        ✔ async test
      """
