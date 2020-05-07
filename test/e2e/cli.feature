Feature: CLI
  In order to use Karma
  As a person who wants to write great tests
  I want command line interface to provide help and useful errors.

  Scenario: Top-level CLI help
    When I execute Karma with arguments: "--help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      Run --help with particular command to see its description and available options.

      Usage:
        karma <command>

      Commands:
        karma init        Initialize a config file.
        karma start       Start the server / do a single run.
        karma run         Trigger a test run.
        karma stop        Stop the server.
        karma completion  Shell completion for karma.

      Options:
        --help     Print usage and options.                                  [boolean]
        --version  Print current version.                                    [boolean]
      """

  Scenario: Current version
    When I execute Karma with arguments: "--version"
    Then the stdout matches RegExp:
      """
      ^\d\.\d\.\d$
      """

  Scenario: Error when command is unknown
    When I execute Karma with arguments: "strat"
    Then the stderr is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      Run --help with particular command to see its description and available options.

      Usage:
        karma <command>

      Commands:
        karma init        Initialize a config file.
        karma start       Start the server / do a single run.
        karma run         Trigger a test run.
        karma stop        Stop the server.
        karma completion  Shell completion for karma.

      Options:
        --help     Print usage and options.                                  [boolean]
        --version  Print current version.                                    [boolean]

      Unknown command: strat
      """

  Scenario: Init command help
    When I execute Karma with arguments: "init --help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      INIT - Initialize a config file.

      Usage:
        karma init [configFile]

      Options:
        --help       Print usage and options.                                [boolean]
        --log-level  <disable | error | warn | info | debug> Level of logging.
        --colors     Use colors when reporting and printing logs.
        --no-colors  Do not use colors when reporting or printing logs.
      """

  Scenario: Start command help
    When I execute Karma with arguments: "start --help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      START - Start the server / do a single run.

      Usage:
        karma start [configFile]

      Options:
        --help                           Print usage and options.            [boolean]
        --port                           <integer> Port where the server is running.
        --auto-watch                     Auto watch source files and run on change.
        --detached                       Detach the server.
        --no-auto-watch                  Do not watch source files.
        --log-level                      <disable | error | warn | info | debug> Level
                                         of logging.
        --colors                         Use colors when reporting and printing logs.
        --no-colors                      Do not use colors when reporting or printing
                                         logs.
        --reporters                      List of reporters (available: dots, progress,
                                         junit, growl, coverage).
        --browsers                       List of browsers to start (eg. --browsers
                                         Chrome,ChromeCanary,Firefox).
        --capture-timeout                <integer> Kill browser if does not capture in
                                         given time [ms].
        --single-run                     Run the test when browsers captured and exit.
        --no-single-run                  Disable single-run.
        --report-slower-than             <integer> Report tests that are slower than
                                         given time [ms].
        --fail-on-empty-test-suite       Fail on empty test suite.
        --no-fail-on-empty-test-suite    Do not fail on empty test suite.
        --fail-on-failing-test-suite     Fail on failing test suite.
        --no-fail-on-failing-test-suite  Do not fail on failing test suite.
      """

  Scenario: Run command help
    When I execute Karma with arguments: "run --help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      RUN - Run the tests (requires running server).

      Usage:
        karma run [configFile] [-- <clientArgs>]

      Options:
        --help                         Print usage and options.              [boolean]
        --port                         <integer> Port where the server is listening.
        --no-refresh                   Do not re-glob all the patterns.
        --fail-on-empty-test-suite     Fail on empty test suite.
        --no-fail-on-empty-test-suite  Do not fail on empty test suite.
        --log-level                    <disable | error | warn | info | debug> Level
                                       of logging.
        --colors                       Use colors when reporting and printing logs.
        --no-colors                    Do not use colors when reporting or printing
                                       logs.
      """

  Scenario: Stop command help
    When I execute Karma with arguments: "stop --help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      STOP - Stop the server (requires running server).

      Usage:
        karma stop [configFile]

      Options:
        --help       Print usage and options.                                [boolean]
        --port       <integer> Port where the server is listening.
        --log-level  <disable | error | warn | info | debug> Level of logging.
      """

  Scenario: Completion command help
    When I execute Karma with arguments: "completion --help"
    Then the stdout is exactly:
      """
      Karma - Spectacular Test Runner for JavaScript.

      COMPLETION - Bash/ZSH completion for karma.

      Installation:
        karma completion >> ~/.bashrc

      Options:
        --help  Print usage and options.                                     [boolean]
      """
