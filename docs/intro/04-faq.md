pageTitle: Frequently Asked Questions
menuTitle: FAQ

The list below is a collection of common questions regarding Karma and its use.
If you have any other questions in mind, please visit the [mailing list] to let the community know.


### Can I use Karma with testing framework X ?
Yes. There are plugins for most of the common testing frameworks (such as Jasmine, Mocha, QUnit).
If there is no plugin for the testing framework you like, go ahead and write one. It is simple -
you can start by looking into the source code of the existing ones.


### Can I use Karma to do end to end testing ?
Karma has primarily been designed for low level (unit) testing. If it's an AngularJS app, you can
use Karma with [karma-ng-scenario] plugin, however we recommend [Protractor] for high level testing.


### Can I use Karma on Continuous Integration server ?
Of course! Check out the docs for [Jenkins], [Travis] or [Semaphore].


### Which version of Karma should I use ?
The latest stable version from NPM (`npm install karma`). See [versioning] for more.
Please use the latest stable version found via NPM (`npm install karma`). See [versioning] for more detailed information.


### Which version of Node.js does Karma run with ?
In general, the two latest stable versions. That means `0.8` and `0.10` at this point.


### The browser does not start.
### The browser just does not start. What's going on?
It's more likely Karma can't find the location of the browser binary (the execution file). You can fix this by setting
the appropriate environment variable with the correct path (Google Chrome for instance uses the `$CHROME_BIN` environment variable).
Check out browsers for more information.


### I'm getting a weird error from the browser, how can I debug it ?
Go to the captured browser and click the "DEBUG" button (or open `http://localhost:9876/debug.html`)
and use the web inspector to see what's going on. (You may need to refresh the debug.html page for it to kick in once
the web inspector is open.)


### I'm getting a syntax error from a HTML file. It looks like the preprocessor isn't working.
The patterns in the `preprocessors` configuration setting are resolved via the `basePath` setting.
See preprocessors for more information. You can also turn on debug logging (use `--log-level debug` when starting Karma)
and Karma will display which files are preprocessed.


### I'm getting a `npm ERR! peerinvalid Peer` error. How can I fix that ?
Try to remove `karma` and `karma-*` modules from your `node_modules` first (for instance `rm -rf /usr/local/lib/node_modules/karma-*`), than install Karma again.


[mailing list]: https://groups.google.com/d/forum/karma-users
[karma-ng-scenario]: https://github.com/karma-runner/karma-ng-scenario
[Protractor]: https://github.com/angular/protractor
[Jenkins]: ../plus/jenkins.html
[Travis]: ../plus/travis.html
[Semaphore]: ../plus/semaphore.html
[versioning]: ../about/versioning.html
