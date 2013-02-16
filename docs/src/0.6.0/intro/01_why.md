# Why?

## Why should I use Testacular?

Because It allows you to test code in real browsers (desktop, mobile, tablets):
*   executing tests locally during development
*   executing tests on a continuous integration server

Also see [this] introduction video on youtube.

## Why am I doing this?

Throughout the development of [AngularJS], we’ve been using [JSTD]
for testing. I really think that JSTD is a great idea. Unfortunately, we
had many problems with JSTD, so we decided to write our own test runner
based on the same idea. We wanted a simple tool just for executing
JavaScript tests that is both stable and fast. That’s why we use the
awesome [SocketIO] library and [Node.js].

[AngularJS]: http://angularjs.org/
[JSTD]: http://code.google.com/p/js-test-driver/
[SocketIO]: http://socket.io/
[Node.js]: http://nodejs.org/
[this]: http://www.youtube.com/watch?v=5mHjJ4xf_K0
