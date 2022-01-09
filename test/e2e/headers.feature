Feature: Custom Headers
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to send custom headers on files sent.

  Scenario: Simple file with headers
    Given a configuration with:
      """
      files = ['headers/*.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      customHeaders = [{
        match: 'foo.js',
        name: 'Custom-Header-Awesomeness',
        value: 'there.is.no.dana.only.zuul'
      }];
      """
    When I start Karma
    Then it passes with:
      """
      .
      Chrome Headless
      """
