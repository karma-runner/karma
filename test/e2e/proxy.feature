Feature: Proxying
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to proxy requests.

  Scenario: Simple file proxy
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      proxies = {
        '/foo.js': '/base/proxy/foo.js'
      }
      """
    When I start Karma
    Then it passes with:
      """
      .
      Chrome Headless
      """

  Scenario: Added by a framework
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher',
        _resolve('proxy/plugin')
      ];
      frameworks = ['jasmine', 'foo']
      """
    When I start Karma
    Then it passes with:
      """
      .
      Chrome Headless
      """

  Scenario: URLRoot
    Given a configuration with:
      """
      files = ['proxy/test.js', 'proxy/foo.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
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
      Chrome Headless
      """
