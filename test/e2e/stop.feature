Feature: Stop karma
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to stop Karma.

  Scenario: A server can't be stopped if it isn't running
    When I stop Karma
    Then it fails with like:
      """
      ERROR \[stopper\]: There is no server listening on port [0-9]+
      """

  Scenario: A server can be stopped
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false;
      """
    When I start a server in background
    And I stop Karma
    Then The server is dead with exit code 0

  Scenario: A server can be stopped and give informative output
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false;
      """
    When I start a server in background
    And I stop Karma with log-level info
    Then it passes with like:
    """
    Server stopped.
    """


  Scenario: A server can be stopped programically
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false;
      logLevel = 'error';
      """
    When I start a server in background
    And I stop a server programmatically
    Then The server is dead with exit code 0
    And The stopper is dead with exit code 0
