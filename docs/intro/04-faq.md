pageTitle: Frequently Asked Questions
menuTitle: FAQ

The list below is a collection of common questions regarding Karma and its use.
If you have any other questions in mind, please visit the [mailing list] to let the community know.


### Can I use Karma with testing framework X?
Yes. There are plugins for most of the common testing frameworks (such as Jasmine, Mocha, QUnit).
If there is no plugin for the testing framework you like, go ahead and write one. It is simple -
you can start by looking into the source code of the existing ones.


### Can I use Karma to do end to end testing?
Karma has primarily been designed for low level (unit) testing. If it's an AngularJS app, you can
use Karma with the [karma-ng-scenario] plugin. However, we recommend [Protractor] for high-level testing.


### Can I use Karma on Continuous Integration server ?
Of course! Check out the docs for [Jenkins], [Semaphore], [TeamCity] or [Travis].


### Which version of Karma should I use?
The latest stable version from npm (`npm install karma`). See [versioning] for more detailed information about Karma's release channels.


### Which version of Node.js does Karma run with?
Karma works on all active LTS versions of node as specified by the [Node.js Release Working Group](https://github.com/nodejs/Release/blob/master/README.md). The nodejs version numbers are set in the package.json. Older versions of karma work with older versions of nodejs, but are not maintained or updated.

[mailing list]: https://groups.google.com/d/forum/karma-users
[karma-ng-scenario]: https://github.com/karma-runner/karma-ng-scenario
[Protractor]: https://github.com/angular/protractor
[Jenkins]: ../plus/jenkins.html
[Semaphore]: ../plus/semaphore.html
[TeamCity]: ../plus/teamcity.html
[Travis]: ../plus/travis.html
[versioning]: ../about/versioning.html
[browsers]: ../config/browsers.html
