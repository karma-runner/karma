Feature: Timeout
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to timeout if a browser fails to connect.

  Scenario: Broken Browser
    Given a configuration with:
      """
      files = ['timeout/specs.js'];
      browsers = [__dirname + '/timeout/fake-browser.sh'];
      plugins = [
        'karma-jasmine',
        'karma-script-launcher'
      ];
      captureTimeout = 100
      """
    When I run Karma
    Then it fails with like:
      """
      have not captured in 100 ms
      """
