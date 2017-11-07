pageTitle: Developing Plugins

Karma can be extended through plugins. A plugin is essentially an NPM module. Typically, there are four kinds of plugins: **frameworks**, **reporters**, **launchers** and **preprocessors**. The best way to understand how this works is to take a look at some of the existing plugins. Following sections list some of the plugins that you might use as a reference.

## Frameworks
- example plugins: [karma-jasmine], [karma-mocha], [karma-requirejs]
- use naming convention is `karma-*`
- use NPM keywords `karma-plugin`, `karma-framework`.

## Reporters
- example plugins: [karma-growl-reporter], [karma-junit-reporter]
- use naming convention is `karma-*-reporter`
- use NPM keywords `karma-plugin`, `karma-reporter`

## Launchers
- example plugins: [karma-chrome-launcher], [karma-sauce-launcher]
- use naming convention is `karma-*-launcher`
- use NPM keywords `karma-plugin`, `karma-launcher`

## Preprocessors
- example plugins: [karma-coffee-preprocessor], [karma-ng-html2js-preprocessor]
- use naming convention is `karma-*-preprocessor`
- user NPM keywords `karma-plugin`, `karma-preprocessor`

## Crazier stuff
Karma is assembled by Dependency Injection and a plugin is just an additional DI module (see [node-di] for more), that can be loaded by Karma. Therefore, it can ask for pretty much any Karma component and interact with it. There are a couple of plugins that do more interesting stuff like this, check out [karma-closure], [karma-intellij], [karma-dart].


[karma-jasmine]: https://github.com/karma-runner/karma-jasmine
[karma-mocha]: https://github.com/karma-runner/karma-mocha

[karma-requirejs]: https://github.com/karma-runner/karma-requirejs
[karma-growl-reporter]: https://github.com/karma-runner/karma-growl-reporter
[karma-junit-reporter]: https://github.com/karma-runner/karma-junit-reporter
[karma-chrome-launcher]: https://github.com/karma-runner/karma-chrome-launcher
[karma-sauce-launcher]: https://github.com/karma-runner/karma-sauce-launcher
[karma-coffee-preprocessor]: https://github.com/karma-runner/karma-coffee-preprocessor
[karma-ng-html2js-preprocessor]: https://github.com/karma-runner/karma-ng-html2js-preprocessor
[karma-closure]: https://github.com/karma-runner/karma-closure
[karma-intellij]: https://github.com/karma-runner/karma-intellij
[karma-dart]: https://github.com/karma-runner/karma-dart
[node-di]: https://github.com/vojtajina/node-di

## Karma Framework API

Karma Framework connects existing testing libraries to Karma's API, so that their
results can be displayed in a browser and sent back to the server.

Karma frameworks _must_ implement a `window.__karma__.start` method that Karma will
call to start test execution. Once this function is called, the `window.__karma__`
object will contain the following methods which you can use to send results back to 
karma:

* `window.__karma__.result(result: Result)` a single test has finished
* `window.__karma__.complete({order, coverage})` the client completed execution of all the tests
* `window.__karma__.error(message: String)` an error happened in the client
* `window.__karma__.info({total: Int, specs: SpecNames})` other data (e.g. number of tests or debugging messages)

Most commonly you'll use the `result` method to send individual test success or failure
statuses. The object the method expects to receive should be in the form:

```js
type Result = {
    // test id
    id: String,

     // test description
    description: String,

    // the suite to which this test belongs. potentially nested.
    suite: Array[String],

    // an array of string error messages that might explain a failure.
    // this is required if success is false.
    log: Array[String],

    success: Boolean, // pass / fail

    skipped: Boolean // skipped / ran
}

type SpecNames = {
    '_': Array[String],
    [$subSpec]: SpecNames
}
```
