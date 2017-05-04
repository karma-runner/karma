Feature: ES Modules
  In order to use Karma
  As a person who wants to write great tests
  I want to use different script types with Karma.

  Scenario: Simple middleware
    Given a configuration with:
      """
      files = [
        { pattern: 'modules/plus.js', esModule: false },
        { pattern: 'modules/minus.mjs', esModule: true },
        'modules/test.js'
      ];
      browsers = ['Firefox'];
      plugins = [
        'karma-jasmine',
        'karma-firefox-launcher'
      ];
      """
    When I start Karma
    Then it passes with:
      """
      ..
      Firefox
      """
