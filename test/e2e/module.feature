Feature: Module Testrunner
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to run tests from the command line.
  Note: This test can only run in chrome, since chrome is the only
  one to support this feature at time of developpement (2018-03-14)

  @not-jenkins
  Scenario: Execute a test with modules in Chrome
    Given a configuration with:
      """
      files = [
          { pattern: 'module/plus.js', type: 'module', include: false },
          { pattern: 'module/test.js', type: 'module' },
      ];
      browsers = ['Chrome'];
      plugins = [
        'karma-jasmine',
        'karma-chrome-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      Executed 2 of 2 SUCCESS
      """
