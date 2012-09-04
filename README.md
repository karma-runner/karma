# Testacular [![Build Status](https://secure.travis-ci.org/vojtajina/testacular.png?branch=master)](http://travis-ci.org/vojtajina/testacular)

A simple tool that allows you to execute JavaScript code in multiple _real_ browsers, powered by [Node.js] and [Socket.io].

[![Build Status](https://github.com/vojtajina/testacular/raw/master/screencast_858.png)](http://www.youtube.com/watch?v=MVw8N3hTfCI)

**The main purpose of Testacular is to make your TDD development easy, fast, and fun.**

## Prerequisites

- [Node.js]
- [NPM] (shipped with Node since 0.6.3)


## Installation

````bash
sudo npm install -g testacular

# or install in a local folder (you have to create symlinks to binaries on your own)
npm install testacular
````

You can install Testacular even without NPM, just get the latest package and create symlinks:

````bash
# replace x.y.z with latest version
curl http://registry.npmjs.org/testacular/-/testacular-x.y.z.tgz | tar -xv && mv package testacular

# create symlinks (optional)
cd testacular
sudo ln -s $PWD/bin/testacular /usr/local/bin/testacular
````

## What is it good for?

Mostly for testing code in multiple browsers (desktop, mobile, tablets):

- executing tests locally during development
- executing tests on a continuous integration server


## Let's do it!

Go into your project and create a testacular configuration. Basically you need to specify the source files that you want to execute.

For an example configuration, see [test/client/config.js](https://github.com/vojtajina/testacular/blob/master/test/client/config.js) which contains most of the options.

````bash
# create config file (testacular.conf.js by default)
testacular init

# start server
testacular start

# open browsers you want to test (if testacular is not configured to do it for you)
open http://localhost:8080

# if you want to run tests manually (without auto watching file changes), you can:
testacular run
````

## Testing frameworks support

Testacular is not an assertion framework, so for that you can use pretty much anything you like.

However, we provide an adapter for [Jasmine].
If you wanna write an adapter for your favourite testing framework, that's great - check out [adapter/jasmine.src.js](https://github.com/vojtajina/testacular/blob/master/adapter/jasmine.src.js) and write your own.


## Why am I doing this?

Throughout the development of [AngularJS], we've been using [JSTD] for testing. I really think that JSTD is a good idea. Unfortunately, we had many problems with JSTD, so we decided to write our own test runner based on the same idea. We wanted a simple tool just for executing JavaScript tests that is both stable and fast. That's why we use the awesome [Socket.io] library. More than that, with [Node.js], we can execute JavaScript without the overhead of a browser, which is much faster. This speed is very helpful during development when we need to get feedback as quick as possible.


## Development

If you are thinking about making Testacular better, or you just want to hack on it, that's great - go and [fork the repo].

````bash
git clone git://github.com/vojtajina/testacular.git # or clone your fork

cd testacular
sudo npm install . --dev # install all dev dependencies (such as grunt, jasmine-node, etc...)
````

If you have any further questions, join the [mailing list](https://groups.google.com/forum/#!forum/testacular) or [submit an issue](https://github.com/vojtajina/testacular/issues/new).

You can follow [@TestacularJS](http://twitter.com/TestacularJS) as well.


## Versions

Testacular uses [Semantic Versioning]. All even versions (eg. `0.2.x`, `0.4.x`) are stable.

### Stable channel

    npm install -g testacular

### Canary channel

    npm install -g testacular@canary

<!--
- anything on console will leak whole iframe window
- it clears console before run (but works only in FF), Chrome/Safari does not allow, so do this:
console.clear = clear;
-->

[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[Socket.io]: http://socket.io/
[Node.js]: http://nodejs.org/
[NPM]: http://npmjs.org/
[Grunt]: http://gruntjs.com/
[Jasmine]: http://pivotal.github.com/jasmine/
[fork the repo]: https://github.com/vojtajina/testacular/fork_select
[Semantic Versioning]: http://semver.org/
