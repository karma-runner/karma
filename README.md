# Testacular [![Build Status](https://secure.travis-ci.org/vojtajina/testacular.png?branch=stable)](http://travis-ci.org/vojtajina/testacular) [![Build Status](https://secure.travis-ci.org/vojtajina/testacular.png?branch=master)](http://travis-ci.org/vojtajina/testacular)

A simple tool that allows you to execute JavaScript code in multiple
_real_ browsers, powered by [Node.js] and [Socket.io].

> The main purpose of Testacular is to make your TDD development easy,
>  fast, and fun. 


## When should I use Testacular?

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

Testacular is not a testing framework, neither an assertion library,
so for that you can use pretty much anything you like. Right now out
of the box there is support for 

* [Mocha]
* [Jasmine]
* [QUnit]
* \_anything else\_ Write your own adapter. It's not that hard. And we
  are here to help.
  
  
## Which Browsers can I use?

All the major browsers are supported, if you want to know more see the
[Browsers] page.


## I want to use it. Where do I sign?

You don't need to sign anything but here are some resources to help
you to get started.

### Obligatory Screencast.

Every serious project has a screencast, so here is ours.  Just click
[here] and let the show begin.

### NPM Installation.

If you have [Node.js] installed, it's as simple as

```bash
$ npm install -g testacular
```

This will give you the latest stable version available on npm. If you
want to live life on the edge you can do so by

```bash
$ npm install -g testacular@canary
```

The curious can have a look at the [wiki] articles for
[Getting Started] and [Versioning].

### Using it.

Go into your project and create a testacular configuration. That is
just a simple JavaScript or CoffeeScript file that tells Testacular
where all the awesomeness of your project are.

You can find a simple example in
[test/client/testacular.conf.js](https://github.com/vojtajina/testacular/blob/master/test/client/testacular.conf.js)
which contains most of the options. 

To create your own from scratch there is the `init` command, which
will be named `testacular.conf.js` by default:

```bash
$ testacular init
```
This will ask you many questions and if you answered them all correct
you will be allowed to use Testacular.

For more information on the configuration options see
[Configuration File Overview].

Now that you have your configuration all that is left to do is to
start Testacular:
```bash
$ testacular start
```

If you want to run tests manually (without auto watching file changes), you can:
```bash
$ testacular run
```
But only if you have started the Testacular server before.


## Why did you create this?

Throughout the development of [AngularJS], we've been using [JSTD] for
testing. I really think that JSTD is a great idea. Unfortunately, we
had many problems with JSTD, so we decided to write our own test
runner based on the same idea. We wanted a simple tool just for
executing JavaScript tests that is both stable and fast. That's why we
use the awesome [Socket.io] library and [Node.js]. 


## I still don't get it. Where can I get help?

* [Wiki]
* [Mailing List]
* [Issuetracker]
* [@TestacularJS] on Twitter

## This is so great. I want to help.

See
[Contributing.md](https://github.com/vojtajina/testacular/blob/master/CONTRIBUTING.md)
or the [wiki] for more information.


## My boss wants a license. So where is it?

### The MIT License

> Copyright (C) 2011-2013 Vojta Jína.
>
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation files
> (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions: 
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software. 
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
> BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
> ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE. 



[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[Socket.io]: http://socket.io/
[Node.js]: http://nodejs.org/
[Jasmine]: http://pivotal.github.com/jasmine/
[Mocha]: http://visionmedia.github.com/mocha/
[QUnit]: http://qunitjs.com/
[Semantic Versioning]: http://semver.org/
[here]: http://www.youtube.com/watch?v=MVw8N3hTfCI
[installers]: http://nodejs.org/download/
[wiki]: https://github.com/vojtajina/testacular/wiki
[Wiki]: https://github.com/vojtajina/testacular/wiki
[Getting Started]: https://github.com/vojtajina/testacular/wiki/Getting-Started
[Versioning]: https://github.com/vojtajina/testacular/wiki/Versioning
[Configuration File Overview]: https://github.com/vojtajina/testacular/wiki/Configuration-File-Overview
[Mailing List]: https://groups.google.com/forum/#!forum/testacular
[Issuetracker]: https://github.com/vojtajina/testacular/issues
[@TestacularJS]: http://twitter.com/TestacularJS
[Browsers]: https://github.com/vojtajina/testacular/wiki/Browsers
[RequireJS]: http://requirejs.org/
[Istanbul]: https://github.com/gotwarlost/istanbul
