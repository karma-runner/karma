pageTitle: Frequently Asked Questions
menuTitle: FAQ

This is a list of common questions. If you have any other question, please go ahead and ask on the
[mailing list].


### Can I use Karma with testing framework X ?
Yes. There are plugins for most of the common testing frameworks (such as Jasmine, Mocha, QUnit).
If there is no plugin for the testing framework you like, go ahead and write one. It is simple -
you can start by looking into the source code of the existing ones.


### Can I use Karma to do end to end testing ?
Karma has primarily been designed for low level (unit) testing. If it's an AngularJS app, you can
use Karma with [karma-ng-scenario] plugin, however we recommend [Protractor] for high level testing.


### Can I use Karma on Continuous Integration server ?
Of course! Check out the docs for [Jenkins], [Travis] or [Semaphore].


### What version of Karma should I use ?
The latest stable version from NPM (`npm install karma`). See [versioning] for more.


### The browser does not start.
It's more likely Karma can't find the location of the browser binary. You can fix that by setting
environmental variable with the correct path, for instance `CHROME_BIN`. Check out browsers for more
information.


### I'm getting a weird error from the browser, how can I debug it ?
Go to the captured browser and click the "DEBUG" button (or open `http://localhost:9876/debug.html`)
and use the web inspector to see what's going on.


### I'm getting a syntax error from an HTML file. It looks like the preprocessor does not work.
The patterns in `preprocessors` configuration are resolved to the `basePath` first.
See preprocessors for more information. You can also turn on debug logging (use `--log-level debug`)
and Karma will show which files are preprocessed.


[mailing list]: https://groups.google.com/d/forum/karma-users
[karma-ng-scenario]: https://github.com/karma-runner/karma-ng-scenario
[Protractor]: https://github.com/angular/protractor
[Jenkins]: ../plus/jenkins.html
[Travis]: ../plus/travis.html
[Semaphore]: ../plus/semaphore.html
[versioning]: ../about/versioning.html
