Feature: Basic Testrunner
  In order to use Karma
  As a person who wants to write great tests
  I want Karma to terminate upon misconfiguration

  Scenario: Execute with missing browser
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['NonExistingBrowser', 'PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false
      """
    When I start Karma
    Then it fails with like:
      """
      Cannot load browser "NonExistingBrowser": it is not registered! Perhaps you are missing some plugin\?
      """
    And it fails with like:
      """
      Found 1 load error
      """

  Scenario: Execute with missing plugin
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-totally-non-existing-plugin',
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false
      """
    When I start Karma
    Then it fails with like:
      """
      Cannot find plugin "karma-totally-non-existing-plugin".
      [\s]+Did you forget to install it\?
      [\s]+npm install karma-totally-non-existing-plugin --save-dev
      """
    And it fails with like:
      """
      Found 1 load error
      """

  Scenario: Execute with missing reporter
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['PhantomJS'];
      reporters = ['unreal-reporter']
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false
      """
    When I start Karma
    Then it fails with like:
      """
      Can not load reporter "unreal-reporter", it is not registered!
      [\s]+Perhaps you are missing some plugin\?
      """
    And it fails with like:
      """
      Found 1 load error
      """

  Scenario: Execute with missing reporter, plugin and browser
    Given a configuration with:
      """
      files = ['basic/plus.js', 'basic/test.js'];
      browsers = ['NonExistingBrowser', 'PhantomJS'];
      reporters = ['unreal-reporter']
      plugins = [
        'karma-totally-non-existing-plugin',
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      singleRun = false
      """
    When I start Karma
    Then it fails with like:
      """
      Can not load reporter "unreal-reporter", it is not registered!
      [\s]+Perhaps you are missing some plugin\?
      """
    And it fails with like:
      """
      Cannot find plugin "karma-totally-non-existing-plugin".
      [\s]+Did you forget to install it\?
      [\s]+npm install karma-totally-non-existing-plugin --save-dev
      """
    And it fails with like:
      """
      Found 2 load errors
      """
