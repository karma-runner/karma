# Karma [![Build Status](https://secure.travis-ci.org/karma-runner/karma.png?branch=master)](http://travis-ci.org/karma-runner/karma) [![Dependency Status](https://david-dm.org/karma-runner/karma.png)](https://david-dm.org/karma-runner/karma) [![devDependency Status](https://david-dm.org/karma-runner/karma/dev-status.png)](https://david-dm.org/karma-runner/karma#info=devDependencies)

A simple tool that allows you to execute JavaScript code in multiple
_real_ browsers.

> The main purpose of Karma is to make your TDD development easy,
>  fast, and fun.


## When should I use Karma?

* You want to test code in *real* browsers.
* You want to test code in multiple browsers (desktop, mobile,
  tablets, etc.).
* You want to execute your tests locally during development.
* You want to execute your tests on a continuous integration server.
* You want to execute your tests on every save.
* You love your terminal.
* You don't want your (testing) life to suck.
* You want to use [Istanbul] to automagically generate coverage
  reports.
* You want to use [RequireJS] for your source files.


## But I still want to use \_insert testing library\_

Karma is not a testing framework, neither an assertion library.
Karma just launches a HTTP server, and generates the test runner HTML file you probably already know from your favourite testing framework.
So for testing purposes you can use pretty much anything you like. There are already plugins for most of the common testing frameworks:

* [Jasmine]
* [Mocha]
* [QUnit]
* and [many others](https://www.npmjs.org/browse/keyword/karma-adapter)

If you can't find an adapter for your favourite framework, don't worry and write your own.
It's not that hard and we are here to help.


## Which Browsers can I use?

All the major browsers are supported, if you want to know more see the
[browsers] page.


## Troubleshooting
See [FAQ](http://karma-runner.github.io/0.12/intro/faq.html).


## I want to use it. Where do I sign?

You don't need to sign anything but here are some resources to help
you to get started...


### Obligatory Screencast.

Every serious project has a screencast, so here is ours.  Just click
[here] and let the show begin.


### Installation.

See [installation](http://karma-runner.github.io/0.12/intro/installation.html).


### Using it.

See [karma-cli](https://github.com/karma-runner/karma-cli), [configuration](http://karma-runner.github.io/0.10/intro/configuration.html).


## I still don't get it. Where can I get help?

* [Docs]
* [Mailing List]
* [Issue Tracker]
* [@JsKarma] on Twitter


## This is so great. I want to help.

Please, see
[contributing](http://karma-runner.github.io/0.12/dev/contributing.html).


## Why did you create this?

Throughout the development of [AngularJS], we've been using [JSTD] for
testing. I really think that JSTD is a great idea. Unfortunately, we
had many problems with JSTD, so we decided to write our own test
runner based on the same idea. We wanted a simple tool just for
executing JavaScript tests that is both stable and fast. That's why we
use the awesome [Socket.io] library and [Node.js].


## My boss wants a license. So where is it?
[MIT License](https://raw.github.com/karma-runner/karma/master/LICENSE)


[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[Socket.io]: http://socket.io/
[Node.js]: http://nodejs.org/
[Jasmine]: https://github.com/karma-runner/karma-jasmine
[Mocha]: https://github.com/karma-runner/karma-mocha
[QUnit]: https://github.com/karma-runner/karma-qunit
[here]: http://www.youtube.com/watch?v=MVw8N3hTfCI
[Mailing List]: https://groups.google.com/forum/#!forum/karma-users
[Issue Tracker]: https://github.com/karma-runner/karma/issues
[@JsKarma]: http://twitter.com/JsKarma
[RequireJS]: http://requirejs.org/
[Istanbul]: https://github.com/gotwarlost/istanbul

[browsers]: http://karma-runner.github.io/0.8/config/browsers.html
[Docs]: http://karma-runner.github.io
