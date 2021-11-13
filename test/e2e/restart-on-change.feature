Feature: Restart on file change
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to re-run tests whenever file changes.

  Scenario: Re-run tests when file changes
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['ChromeHeadlessNoSandbox'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      restartOnFileChange = true;
      singleRun = false;
      """
    When I start a server in background
    And I wait until server output contains:
      """
      ..
      Chrome Headless
      """
    When I touch file: "basic/test.js"
    Then the background stdout matches RegExp:
      """
      Executed 2 of 2 SUCCESS[\s\S]+Executed 2 of 2 SUCCESS
      """
