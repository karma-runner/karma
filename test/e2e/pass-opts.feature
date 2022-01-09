Feature: Passing Options
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to pass arguments from the config file to the browser.

  Scenario: Passing Options to run on the Command Line
    Given a configuration with:
      """
      files = ['pass-opts/test.js'];
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
      Executed 1 of 1 (1 FAILED)
      """
    And I run Karma with additional arguments: "-- arg1 arg2"
    Then it passes with:
      """
      .
      """
