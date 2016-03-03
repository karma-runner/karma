Karma is essentially a tool which spawns a web server that executes source code against test code for each of the browsers connected.
The results of each test against each browser are examined and displayed via the command line to the developer
such that they can see which browsers and tests passed or failed.

A browser can be captured either
- manually, by visiting the URL where the Karma server is listening (typically `http://localhost:9876/`),
- or automatically by letting Karma know which browsers to start when Karma is run (see [browsers]).

Karma also watches all the files, specified within the configuration file, and whenever any file changes, it triggers the test run by
sending a signal to the testing server to inform all of the captured browsers to run the test code again.
Each browser then loads the source files inside an IFrame, executes the tests and reports the results back to the server.

The server collects the results from all of the captured browsers and presents them to the developer.

This is only a very brief overview, as the internals of how Karma works aren't entirely necessary when using Karma.

However, if you are interested in learning more, Karma itself originates from a university thesis, which goes into detail about the design
and implementation, and it is available to read [right here].

[right here]: https://github.com/karma-runner/karma/raw/master/thesis.pdf
[browsers]: ../config/browsers.html
