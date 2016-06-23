Feature: Middleware
  In order to use Karma
  As a person who wants to write great tests
  I want to use custom middleware with Karma.

  Scenario: Simple middleware
    Given a configuration with:
      """
      files = ['middleware/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        _resolve('middleware/middleware')
      ];
      middleware = [
        'foo'
      ]
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """

  Scenario: Frameworks can add middleware
    Given a configuration with:
      """
      files = ['middleware/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        _resolve('middleware/middleware')
      ];
      frameworks = ['jasmine', 'foo']
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """
