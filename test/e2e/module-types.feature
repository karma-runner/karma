Feature: ES Modules
  In order to use Karma
  As a person who wants to write great tests
  I want to use different script types with Karma.

  Scenario: Globbing modules, with both .js and .mjs extensions
    Given a configuration with:
      """
      files = [
        { pattern: 'modules/**/*.js', type: 'module' },
        { pattern: 'modules/**/*.mjs', type: 'module' },
      ];
      // Chrome fails on Travis, so we must use Firefox (which means we must
      // manually enable modules).
      customLaunchers = {
        FirefoxWithModules: {
          base: 'FirefoxHeadless',
          prefs: {
            'dom.moduleScripts.enabled': true
          }
        }
      };
      browsers = ['FirefoxWithModules'];
      frameworks = ['mocha', 'chai'];
      plugins = [
        'karma-mocha',
        'karma-chai',
        'karma-firefox-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      Executed 4 of 4 SUCCESS
      """
