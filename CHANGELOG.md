### v0.5.8
* Fix #283
* Suppress global leak for istanbul
* Fix growl reporter to work with `testacular run`
* Upgrade jasmine to 1.3.1
* Fix file sorting
* Fix #265
* Support for more mime-types on served static files
* Fix opening Chrome on Windows
* Upgrade growly to 1.1.0

### v0.5.7
* Support code coverage for qunit.
* Rename port-runner option in cli to runner-port
* Fix proxy handler (when no proxy defined)
* Fix #65

### v0.5.6
* Growl reporter !
* Batch changes (eg. `git checkout` causes only single run now)
* Handle uncaught errors and disconnect all browsers
* Global binary prefers local versions

### v0.5.5
* Add QUnit adapter
* Report console.log()

### v0.5.4
* Fix PhantomJS launcher
* Fix html2js preprocessor
* NG scenario adapter: show html output

### v0.5.3
* Add code coverage !

### v0.5.2
* Init: ask about using Require.js

### v0.5.1
* Support for Require.js
* Fix testacular init basePath

### v0.5.0
* Add preprocessor for LiveScript
* Fix JUnit reporter
* Enable process global in config file
* Add OS name in the browser name
* NG scenario adapter: hide other outputs to make it faster
* Allow config to be written in CoffeeScript
* Allow espaced characters in served urls

### v0.4.0 (stable)

### v0.3.12
* Allow calling run() pragmatically from JS

### v0.3.11
* Fix runner to wait for stdout, stderr
* Make routing proxy always changeOrigin

### v0.3.10
* Fix angular-scenario adapter + junit reporter
* Use flash socket if web socket not available

### v0.3.9
* Retry starting a browser if it does not capture
* Update mocha to 1.5.0
* Handle mocha's xit

### v0.3.8
* Kill browsers that don't capture in captureTimeout ms
* Abort build if any browser fails to capture
* Allow multiple profiles of Firefox

### v0.3.7
* Remove Travis hack
* Fix Safari launcher

### v0.3.6
* Remove custom launcher (constructor)
* Launcher - use random id to allow multiple instances of the same browser
* Fix Firefox launcher (creating profile)
* Fix killing browsers on Linux and Windows

### v0.3.5
* Fix opera launcher to create new prefs with disabling all pop-ups

### v0.3.4
* Change "reporter" config to "reporters"
* Allow multiple reporters
* Fix angular-scenario adapter to report proper description
* Add JUnit xml reporter
* Fix loading files from multiple drives on Windows
* Fix angular-scenario adapter to report total number of tests

### v0.3.3
* Allow proxying files, not only directories

### v0.3.2
* Disable autoWatch if singleRun
* Add custom script browser launcher
* Fix cleaning temp folders

### v0.3.1
* Run tests on start (if watching enabled)
* Add launcher for IE8, IE9

### v0.3.0
* Change browser binaries on linux to relative
* Add report-slower-than to CLI options
* Fix PhantomJS binary on Travis CI

### v0.2.0 (stable)

### v0.1.3
* Launch Canary with crankshaft disabled
* Make the captured page nicer

### v0.1.2
* Fix jasmine memory leaks
* support __filename and __dirname in config files

### v0.1.1
* Report slow tests (add `reportSlowerThan` config option)
* Report time in minutes if it's over 60 seconds
* Mocha adapter: add ability to fail during beforeEach/afterEach hooks
* Mocha adapter: add dump()
* NG scenario adapter: failure includes step name
* Redirect /urlRoot to /urlRoot/
* Fix serving with urlRoot

### v0.1.0
* Adapter for AngularJS scenario runner
* Allow serving Testacular from a subpath
* Fix race condition in testacular run
* Make testacular one binary (remove `testacular-run`, use `testacular run`)
* Add support for proxies
* Init script for generating config files (`testacular init`)
* Start Firefox without custom profile if it fails
* Preserve order of watched paths for easier debugging
* Change default port to 9876
* Require node v0.8.4+

### v0.0.17
* Fix race condition in manually triggered run
* Fix autoWatch config

### v0.0.16
* Mocha adapter
* Fix watching/resolving on Windows
* Allow glob patterns
* Watch new files
* Watch removed files
* Remove unused config (autoWatchInterval)

### v0.0.15
* Remove absolute paths from urls (fixes Windows issue with C:\\)
* Add browser launcher for PhantomJS
* Fix some more windows issues

### v0.0.14
* Allow require() inside config file
* Allow custom browser launcher
* Add browser launcher for Opera, Safari
* Ignore signals on windows (not supported yet)

### v0.0.13
* Single run mode (capture browsers, run tests, exit)
* Start browser automatically (chrome, canary, firefox)
* Allow loading external files (urls)

### v0.0.12
* Allow console in config
* Warning if pattern does not match any file

### v0.0.11
* Add timing (total / net - per specs)
* Dots reporter - wrap at 80

### v0.0.10
* Add DOTS reporter
* Add no-colors option for reporters
* Fix web server to expose only specified files

### v0.0.9
* Proper exit code for runner
* Dynamic port asigning (if port already in use)
* Add log-leve, log-colors cli arguments + better --help
* Fix some IE errors (indexOf, forEach fallbacks)

### v0.0.8
* Allow overriding configuration by cli arguments (+ --version, --help)
* Persuade IE8 to not cache context.html
* Exit runner if no captured browser
* Fix delayed execution (streaming to runner)
* Complete run if browser disconnects
* Ignore results from previous run (after server reconnecting)
* Server disconnects - cancel execution, clear browser info

### v0.0.7
* Rename to Testacular

### v0.0.6
* Better debug mode (no caching, no timestamps)
* Make dump() a bit better
* Disconnect browsers on SIGTERM (kill, killall default)

### v0.0.5
* Fix memory (some :-D) leaks
* Add dump support
* Add runner.html

### v0.0.4
* Progress bar reporting
* Improve error formatting
* Add Jasmine lib (with iit, ddescribe)
* Reconnect client each 2sec, remove exponential growing

### v0.0.3
* Jasmine adapter: ignore last failed filter in exclusive mode
* Jasmine adapter: add build (no global space pollution)

### 0.0.2
* Run only last failed tests (jasmine adapter)

### 0.0.1
* Initial version with only very basic features
