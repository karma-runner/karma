Karma is essentially a web server that serves all the source files of the project under the test and
also keeps a connection with all captured browsers.

A browser can be captured either
- manually by opening the url, where Karma server is listening (typically `http://localhost:9876/`),
- or automatically by letting Karma to start the browsers (see [browsers]).

Karma also watches all the files and whenever any file changes, it triggers the test run by
sending a signal to all captured browsers. Each browser then loads the source files inside
an iframe, executes the tests and reports the results back to the server.

The server collects results from all captured browsers and presents them to the developer.

This is only a very brief overview, as I believe you don't have to know the details in order to use
Karma. However, if you are interested, I wrote a thesis about Karma, which explains the design
and implementation in more depth. You can read it [here].

[here]: https://github.com/karma-runner/karma/raw/master/thesis.pdf
[browsers]: ../config/browsers.html
