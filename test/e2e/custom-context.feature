Feature: Custom Context File
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to use a custom context file

  Scenario: Custom context.html file
    Given a configuration with:
      """
      files = ['context/*.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      customContextFile = 'context/context2.html'
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """
