Feature: Browser Console Configuration
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to customize how the browser console is logged.

  Scenario: Execute logging program with defaults
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      LOG: 'foo'
      """
    Then it passes with like:
      """
      DEBUG: 'bar'
      """
    Then it passes with like:
      """
      INFO: 'baz'
      """
    Then it passes with like:
      """
      WARN: 'foobar'
      """
    Then it passes with like:
      """
      ERROR: 'barbaz'
      """
    Then it passes with like:
      """
      SUCCESS
      """


  Scenario: Execute logging program
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        path: 'test/e2e/console.log',
        format: '%t:%m'
      };
      """
    When I start Karma
    Then the file at test/e2e/console.log contains:
      """
      log:'foo'
      debug:'bar'
      info:'baz'
      warn:'foobar'
      error:'barbaz'
      """

  Scenario: Execute logging program with different format
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        path: 'test/e2e/console.log',
        format: '%t:%T:%m'
      };
      """
    When I start Karma
    Then the file at test/e2e/console.log contains:
      """
      log:LOG:'foo'
      debug:DEBUG:'bar'
      info:INFO:'baz'
      warn:WARN:'foobar'
      error:ERROR:'barbaz'
      """

  Scenario: Execute logging program with different log-level
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        path: 'test/e2e/console.log',
        format: '%t:%T:%m',
        level: 'warn'
      };
      """
    When I start Karma
    Then the file at test/e2e/console.log contains:
      """
      log:LOG:'foo'
      warn:WARN:'foobar'
      error:ERROR:'barbaz'
      """

  Scenario: Execute logging program when logging browser
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        path: 'test/e2e/console.log',
        format: '%b'
      };
      """
    When I start Karma
    Then the file at test/e2e/console.log contains:
      """
      Phantom
      """

  Scenario: Execute logging program and disabling terminal
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        path: 'test/e2e/console.log',
        format: '%b',
        terminal: false
      };
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """

  Scenario: Execute logging program and disabling terminal
    Given a configuration with:
      """
      files = ['browser-console/log.js', 'browser-console/test.js'];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      browserConsoleLogOptions = {
        terminal: false
      };
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """
