# SlimJim

Simple tool, that allows you to execute JavaScript code in multiple browsers or just in Node.js


## Prerequisites

* [Node.js]
* [NPM] (shipped with Node since 0.6.3)


## Installation

    sudo npm install slim-jim -g

    # or install in local folder
    npm install slim-jim

You can install SlimJim even without NPM, just clone the git repo and create symlinks:

    git clone git://github.com/vojtajina/slim-jim.git
    sudo ln -s $PWD/slim-jim/bin/slim-jim /usr/local/bin/slim-jim
    sudo ln -s $PWD/slim-jim/bin/slim-jim-run /usr/local/bin/slim-jim-run


## What is this good for ?

Mostly for testing you code in multiple browsers (desktop, mobile, tablets):

* executing tests on continuous integration server
* executing tests during development

SlimJim does not provide any testing framework, so you can use anything you like. It's main goal is to be **stable** and **highly extensible**.


## Why am I doing this ?

During development of [AngularJS], we've been using [JSTD] for testing. I really think, it's great idea. Unfortunately, we had many problems with JSTD, so we decided to write our own tool, without testing frameworks or anything you actually don't need. Just simple tool for execution JavaScript, that is stable and fast. That's why we use awesome [socket.io] library. More than that, with Node.js, we can execute javascript even without any browser, which is much faster, so it's very helpful during development, when we need to get the feedback as quick as possible.


[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[socket.io]: http://socket.io/
[Node.js]: http://nodejs.org/
[NPM]: http://npmjs.org/
