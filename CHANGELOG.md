<a name="v0.8.0"></a>
## v0.8.0 (2013-03-18)


#### Breaking Changes

* rename the project to "Karma":
- whenever you call the "testacular" binary, change it to "karma", eg. `testacular start` becomes `karma start`.
- if you rely on default name of the config file, change it to `karma.conf.js`.
- if you access `__testacular__` object in the client code, change it to `__karma__`, eg. `window.__testacular__.files` becomes `window.__karma__.files`. ([026a20f7](https://github.com/karma-runner/karma/commit/026a20f7b467eb3b39c68ed509acc06e5dad58e6))

<a name="v0.6.1"></a>
### v0.6.1 (2013-03-18)


#### Bug Fixes

* **config:** do not change urlRoot even if proxied ([1be1ae1d](https://github.com/karma-runner/karma/commit/1be1ae1dc7ff7314f4ac2854815cb39d31362f14))
* **coverage:** always send a result object ([2d210aa6](https://github.com/karma-runner/karma/commit/2d210aa6697991f2eba05de58a696c5210485c88), closes [#365](https://github.com/karma-runner/karma/issues/365))
* **reporter.teamcity:** report spec names and proper browser name ([c8f6f5ea](https://github.com/karma-runner/karma/commit/c8f6f5ea0c5c40d37b511d51b49bd22c9da5ea86))

<a name="v0.6.0"></a>
## v0.6.0 (2013-02-22)

<a name="v0.5.11"></a>
### v0.5.11 (2013-02-21)


#### Bug Fixes

* **adapter.requirejs:** do not configure baseUrl automatically ([63f3f409](https://github.com/karma-runner/karma/commit/63f3f409ae85a5137396a7ed6537bedfe4437cb3), closes [#291](https://github.com/karma-runner/karma/issues/291))
* **init:** add missing browsers (Opera, IE) ([f39e5645](https://github.com/karma-runner/karma/commit/f39e5645ec561c2681d907f7c1611f01911ee8fd))
* **reporter.junit:** Add browser log output to JUnit.xml ([f108799a](https://github.com/karma-runner/karma/commit/f108799a4d8fd95b8c0250ee83c23ada25d026b9), closes [#302](https://github.com/karma-runner/karma/issues/302))


#### Features

* add Teamcity reporter ([03e700ae](https://github.com/karma-runner/karma/commit/03e700ae2234ca7ddb8f9235343e3b0c80868bbd))
* **adapter.jasmine:** remove only last failed specs anti-feature ([435bf72c](https://github.com/karma-runner/karma/commit/435bf72cb12112462940c8114fbaa19f9de38531), closes [#148](https://github.com/karma-runner/karma/issues/148))
* **config:** allow empty config file when called programmatically ([f3d77424](https://github.com/karma-runner/karma/commit/f3d77424009f621e1fb9d60eeec7f052ebb3c585), closes [#358](https://github.com/karma-runner/karma/issues/358))

<a name="v0.5.10"></a>
### v0.5.10 (2013-02-14)


#### Bug Fixes

* **init:** fix the logger configuration ([481dc3fd](https://github.com/karma-runner/karma/commit/481dc3fd75f45a0efa8aabdb1c71e8234b9e8a06), closes [#340](https://github.com/karma-runner/karma/issues/340))
* **proxy:** fix crashing proxy when browser hangs connection ([1c78a01a](https://github.com/karma-runner/karma/commit/1c78a01a19411accb86f0bde9e040e5088752575))


#### Features

* set urlRoot to /__karma__/ when proxying the root ([8b4fd64d](https://github.com/karma-runner/karma/commit/8b4fd64df6b7d07b5479e43dcd8cd2aa5e1efc9c))
* **adapter.requirejs:** normalize paths before appending timestamp ([94889e7d](https://github.com/karma-runner/karma/commit/94889e7d2de701c67a2612e3fc6a51bfae891d36))
* update dependencies to the latest ([93f96278](https://github.com/karma-runner/karma/commit/93f9627817f2d5d9446de9935930ca85cfa7df7f), [e34d8834](https://github.com/karma-runner/karma/commit/e34d8834d69ec4e022fcd6e1be4055add96d693c))


<a name="v0.5.9"></a>
### v0.5.9 (2013-02-06)


#### Bug Fixes

* **adapter.requirejs:** show error if no timestamp defined for a file ([59dbdbd1](https://github.com/karma-runner/karma/commit/59dbdbd136baa87467b9b9a4cb6ce226ae87bbef))
* **init:** fix logger configuration ([557922d7](https://github.com/karma-runner/karma/commit/557922d71941e0929f9cdc0d3794424a1f27b311))
* **reporter:** remove newline from base reporter browser dump ([dfae18b6](https://github.com/karma-runner/karma/commit/dfae18b63b413a1e6240d00b9dc0521ac0386ec5), closes [#297](https://github.com/karma-runner/karma/issues/297))
* **reporter.dots:** only add newline to message when needed ([dbe1155c](https://github.com/karma-runner/karma/commit/dbe1155cb57fc4caa792f83f45288238db0fc7e0)

#### Features

* add "debug" button to easily open debugging window ([da85aab9](https://github.com/karma-runner/karma/commit/da85aab927edd1614e4e05b136dee834344aa3cb))
* **config:** support running on a custom hostname ([b8c5fe85](https://github.com/karma-runner/karma/commit/b8c5fe8533b13fd59cbf48972d2021069a84ae5b))
* **reporter.junit:** add a 'skipped' tag for skipped testcases ([6286406e](https://github.com/karma-runner/karma/commit/6286406e0a36a61125ea16d6f49be07030164cb0), closes [#321](https://github.com/karma-runner/karma/issues/321))


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

## v0.5.0
* Add preprocessor for LiveScript
* Fix JUnit reporter
* Enable process global in config file
* Add OS name in the browser name
* NG scenario adapter: hide other outputs to make it faster
* Allow config to be written in CoffeeScript
* Allow espaced characters in served urls

## v0.4.0 (stable)

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

## v0.3.0
* Change browser binaries on linux to relative
* Add report-slower-than to CLI options
* Fix PhantomJS binary on Travis CI

## v0.2.0 (stable)

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

## v0.1.0
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
