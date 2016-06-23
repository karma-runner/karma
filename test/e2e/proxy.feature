Feature: Proxying
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to proxy requests.

  Scenario: Simple file proxy
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      proxies = {
        '/foo.js': '/base/proxy/foo.js'
      }
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """

  Scenario: Added by a framework
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        _resolve('proxy/plugin')
      ];
      frameworks = ['jasmine', 'foo']
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """

  Scenario: URLRoot
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      urlRoot = '/__karma__/';
      proxies = {
        '/foo.js': '/base/proxy/foo.js'
      }
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """
