Feature: Passing Options
  In order to use Karma
  As a person who wants to write great tests
  I want to the browser to reconnect to Karma when it gets disconnected.

  Scenario: Manual disconnect from the browser
    Given a configuration with:
      """
      files = ['reconnecting/test.js', 'reconnecting/plus.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      client = {
        jasmine: {
          random: false
        }
      };
      """
    When I start Karma
    Then it passes with:
      """
      .....
      HeadlessChrome
      """
