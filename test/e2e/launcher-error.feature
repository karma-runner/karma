Feature: Launcher error
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to output stderr if a browser fails to connect.

  Scenario: Broken Browser
    Given a configuration with:
      """
      files = ['launcher-error/specs.js'];
      browsers = [__dirname + '/launcher-error/fake-browser.sh'];
      plugins = [
        'karma-jasmine',
        'karma-script-launcher'
      ];
      """
    When I run Karma
    Then it fails with like:
      """
      Missing fake dependency
      """
