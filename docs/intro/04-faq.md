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
The latest stable version from NPM (`npm install karma`). See [versioning] for more detailed information about Karma's release channels.


### Which version of Node.js does Karma run with ?
The two latest stable versions. That means `0.8` and `0.10` at this point.


[mailing list]: https://groups.google.com/d/forum/karma-users
[karma-ng-scenario]: https://github.com/karma-runner/karma-ng-scenario
[Protractor]: https://github.com/angular/protractor
[Jenkins]: ../plus/jenkins.html
[Travis]: ../plus/travis.html
[Semaphore]: ../plus/semaphore.html
[versioning]: ../about/versioning.html
[browsers]: ../config/browsers.html
