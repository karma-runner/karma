Feature: Passing Options
  In order to use Karma
  As a person who wants to write great tests
  I want to the browser to reconnect to Karma when it gets disconnected.

  Scenario: Manual disconnect from the browser
    Given a configuration with:
      """
      files = ['reconnecting/test.js', 'reconnecting/plus.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with:
      """
      .....
      PhantomJS
      """
