Feature: Custom Display-name
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to send custom display-name.

  Scenario: Execute a test in ChromeHeadless
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['customChrome'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      customLaunchers = {
        customChrome: {
          base: 'ChromeHeadlessNoSandbox',
          displayName: '42'
        }
      };
      """
    When I start Karma
    Then it passes with:
      """
      ..
      42
      """
