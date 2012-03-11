# Testacular [![Build Status](https://secure.travis-ci.org/vojtajina/testacular.png?branch=master)](http://travis-ci.org/vojtajina/testacular)

Simple tool, that allows you to execute JavaScript code in multiple browsers or just in [Node.js].


## Prerequisites

* [Node.js]
* [NPM] (shipped with Node since 0.6.3)


## Installation

    sudo npm install testacular -g

    # or install in local folder
    npm install testacular

You can install Testacular even without NPM, just clone the git repo, build and create symlinks (you will need [Jake] build tool):

    git clone git://github.com/vojtajina/slim-jim.git
    cd testacular
    jake build
    sudo ln -s $PWD/bin/testacular /usr/local/bin/testacular
    sudo ln -s $PWD/bin/testacular-run /usr/local/bin/testacular


## What is this good for ?

Mostly for testing you code in multiple browsers (desktop, mobile, tablets):

* executing tests on continuous integration server
* executing tests during development

Testacular does not provide any testing framework, so you can use anything you like. It's main goal is to be **stable** and **highly extensible**.


## Why am I doing this ?

During development of [AngularJS], we've been using [JSTD] for testing. I really think, it's great idea. Unfortunately, we had many problems with JSTD, so we decided to write our own tool, without testing frameworks or anything you actually don't need. Just simple tool for execution JavaScript, that is stable and fast. That's why we use awesome [socket.io] library. More than that, with Node.js, we can execute javascript even without any browser, which is much faster, so it's very helpful during development, when we need to get the feedback as quick as possible.



- anything on console will leak whole iframe window
- it clears console before run (but works only in FF), Chrome/Safari does not allow, so do this:
console.clear = clear;


[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[socket.io]: http://socket.io/
[Node.js]: http://nodejs.org/
[NPM]: http://npmjs.org/
[Jake]: https://github.com/mde/jake
