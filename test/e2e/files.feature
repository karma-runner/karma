Feature: Including files
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to include and exclude files

  Scenario: Execute a test excluding a file
    Given a configuration with:
      """
      files = [
        {pattern: 'files/log_foo.js', included: false},
        'files/*.js'
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with:
      """
      .
      PhantomJS
      """

  Scenario: Execute a test excluding an explicitly included file
    Given a configuration with:
      """
      files = [
        {pattern: 'files/log_foo.js', included: true},
        {pattern: 'files/log_foo.js', included: false},
        'files/*.js'
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/log_foo.js" were excluded or matched by prior matchers.
      """

  Scenario: Execute a test excluding an explicitly included file in another order
    Given a configuration with:
      """
      files = [
        'files/*.js',
        {pattern: 'files/log_foo.js', included: true},
        {pattern: 'files/log_foo.js', included: false}
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/log_foo.js" were excluded or matched by prior matchers.
      """

  Scenario: Execute a test excluding an file included with brackets patterns
    Given a configuration with:
      """
      files = [
        'files/test.js',
        {pattern: 'files/log_foo.js', included: false},
        {pattern: 'files/{log,bug}_foo.js', included: true}
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/{log,bug}_foo.js" were excluded or matched by prior matchers.
      """

  Scenario: Execute a test excluding an file included with wildcard
    Given a configuration with:
      """
      files = [
        'files/test.js',
        {pattern: 'files/+(log|bug)_foo.js', included: false},
        {pattern: 'files/*.js', included: true}
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/*.js" were excluded or matched by prior matchers.
      """

  Scenario: Execute a test excluding an file included with glob-star
    Given a configuration with:
      """
      files = [
        'files/test.js',
        {pattern: 'files/*.js', included: false},
        {pattern: 'files/**', included: true}
       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/**" were excluded or matched by prior matchers.
      """

  Scenario: Execute a test excluding an file included with ext. glob patterns
    Given a configuration with:
      """
      files = [
        'files/test.js',
        {pattern: 'files/+(log|bug)_foo.js', included: false},
        {pattern: 'files/{log,bug}_foo.js', included: true}

       ];
      browsers = ['PhantomJS'];
      plugins = [
        'karma-jasmine',
        'karma-phantomjs-launcher'
      ];
      """
    When I start Karma
    Then it passes with like:
      """
      .
      PhantomJS
      """
    And it passes with like:
      """
      files/{log,bug}_foo.js" were excluded or matched by prior matchers.
      """
