Feature: UpstreamProxy
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to work when it is behind a proxy that prepends to the base path.

  Scenario: UpstreamProxy
    Given a configuration with:
      """
      files = ['behind-proxy/plus.js', 'behind-proxy/test.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      urlRoot = '/__karma__/';
      upstreamProxy = {
        path: '/__proxy__/'
      };
      """
    And a proxy on port 9875 that prepends '/__proxy__/' to the base path
    When I start Karma with additional arguments: "--log-level debug"
    Then it passes with regexp:
      """
      Chrome Headless.*Executed.*SUCCESS
      """
