Feature: UpstreamProxy
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to to work when it is behind a proxy that prepends to the base path.

  Scenario: UpstreamProxy
    Given a configuration with:
      """
      files = ['behind-proxy/plus.js', 'behind-proxy/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      urlRoot = '/__karma__/';
      upstreamProxy = {
        path: '/__proxy__/'
      };
      """
    When I start Karma behind a proxy on port 9875 that prepends '/__proxy__/' to the base path
    Then it passes with:
      """
      ..
      PhantomJS
      """
