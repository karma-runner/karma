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
    And command line arguments of: "-- arg1 arg2"
    When I run Karma
    Then it passes with no debug:
      """
      .
      """
