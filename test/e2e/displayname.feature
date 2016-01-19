Feature: Custom Display-name
  In order to use Karma
  As a person who wants to write great tests
  I want to Karma to send custom display-name.

  Scenario: Execute a test in PhantomJS
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['customPhantom'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      customLaunchers = {
        customPhantom: {
          base: 'PhantomJS',
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