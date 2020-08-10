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

## Outline of workflow.

Here is roughly how Karma works:

After starting up, Karma loads plugins and the configuration file, then starts its local web server which listens for connections.
Any browser already waiting on websockets from the server will reconnect immediately. As part of loading the plugins, test reporters
register for 'browser' events so they are ready for test results.

Then karma launches zero, one, or more browsers, setting their start page the Karma server URL.

When the browsers connect, Karma serves a 'client.html' page; when this page runs in the browser it connects back to the server via websockets.

Once the server sees the websocket connection, it instructs the client -- over the websocket -- to execute tests.  The client page opens an iframe with a 'context.html' page from the server. The server generates this context.html page using the configuration. This page includes the test framework adapter, the code to be tested, and the test code.

When the browser loads this context page, the onload event handler connects the context page to the client page via postMessage. The framework adapter is in charge at this point: it runs the test, reporting errors or success by messaging through the client page.

Messages sent to the client page are forwarded through the websocket to the Karma server. The server re-dispatches these messages as 'browser' events.  The reporters listening to 'browser' events get the data; they may print it, save it to files, or forward the data to another service.
Since the data is sent by the test framework adapter to the reporter, adapters and reporters almost always come in pairs, like karma-jasmine and karma-jasmine-reporter.  The detailed content of test-result data is of no concern to other parts of karma: only the reporter needs to know its format.

Karma has many variations and options that may cause different workflow with different configurations.

If you are interested in learning more about the design, Karma itself originates from a university thesis, which goes into detail about the design
and implementation, and it is available to read [right here].

[right here]: https://github.com/karma-runner/karma/raw/master/thesis.pdf
[browsers]: ../config/browsers.html
