pageTitle: Developing Plugins

Karma can be extended through plugins. There are five kinds of plugins: *framework*, *reporter*, *launcher*, *preprocessor* and *middleware*. Each type allows to modify a certain aspect of the Karma behavior.

- A *framework* connects a testing framework (like Mocha) to a Karma API, so browser can send test results back to a Karma server.
- A *reporter* defines how test results are reported to a user.
- A *launcher* allows Karma to launch different browsers to run tests in.
- A *preprocessor* is responsible for transforming/transpiling source files before loading them into a browser.
- A *middleware* can be used to customise how files are served to a browser.

## Dependency injection

Karma is assembled using [*dependency injection*](https://en.wikipedia.org/wiki/Dependency_injection). It is important to understand this concept to be able to develop plugins.

On the very high level you can think of Karma as an object where each key (a *DI token*) is mapped to a certain Karma object (a *service*). For example, `config` DI token maps to `Config` instance, which holds current Karma configuration. Plugins can request (or *inject*) various Karma objects by specifying a corresponding DI token. Upon injection a plugin can interact with injected services to implement their functionality.

There is no exhaustive list of all available services and their DI tokens, but you can discover them by reading Karma's or other plugins' source code.

## Plugin structure

Each plugin is essentially a service with its associated DI token. When user [activates a plugin][plugins] in their config, Karma looks for a corresponding DI token and instantiates a service linked to this DI token.

To declare a plugin one should define a DI token for the plugin and explain Karma how to instantiate it. A DI token consists of two parts: a plugin type and plugin's unique name. The former defines what a plugin can do, requirements to the service's API and when it is instantiated. The latter is a unique name, which a plugin user will use to activate a plugin. 

It is totally valid for a plugin to define multiple services. This can be done by adding more keys to the object exported by the plugin. Common example of this would be `framework` + `reporter` plugins, which usually come together.

Let's make a very simple plugin, which prints "Hello, world!" when instantiated. We'll use a `framework` type as it is instantiated early in the Karma lifecycle and does not have any requirements to its API. Let's call our plugin "hello", so its unique name will be `hello`. Joining these two parts we get a DI token for our plugin `framework:hello`. Let's declare it.

```js
// hello-plugin.js

// A factory function for our plugin, it will be called, when Karma needs to
// instantiate a plugin. Normally it should return an instance of the service
// conforming to the API requirements of the plugin type (more on that below),
// but for our simple example we don't need any service and just print 
// a message when function is called.
function helloFrameworkFactory() {
  console.log('Hello, world!')
}

module.exports = {
  // Declare the plugin, so Karma knows that it exists.
  // 'factory' tells Karma that it should call `helloFrameworkFactory`
  // function and use whatever it returns as a service for the DI token
  // `framework:hello`.
  'framework:hello': ['factory', helloFrameworkFactory]
};
```

```js
// karma.conf.js

module.exports = (config) => {
  config.set({
    plugins: [
      require('./hello-plugin')
    ],
    // Activate our plugin by specifying its unique name in the 
    // corresponding configuration key.
    frameworks: ['hello']
  })
}
```

## Injecting dependencies

In "Dependency injection" section we discussed that it is possible to inject any Karma services into a plugin and interact with them. This can be done by setting an `$inject` property on the plugin's factory function to an array of DI tokens plugin wishes to interact with. Karma will pick up this property and pass requested services to the factory functions as parameters.

Let's make the `hello` framework a bit more useful and make it add `hello.js` file to the `files` array. This way users of the plugin can, for example, access a function defined in `hello.js` from their tests.

```js
// hello-plugin.js

// Add parameters to the function to receive requested services.
function helloFrameworkFactory(config) {
  config.files.unshift({
    pattern: __dirname + '/hello.js',
    included: true,
    served: true,
    watched: false
  })
}

// Declare DI tokens plugin wants to inject.
helloFrameworkFactory.$inject = ['config']

module.exports = {
  'framework:hello': ['factory', helloFrameworkFactory]
};
```

The Karma config is unchanged and is omitted for brevity. See above example for the plugin usage.

Note: Currently, Karma uses [node-di] library as a DI implementation. The library is more powerful than what's documented above, however, the DI implementation may change in the future, so we recommend not to rely on the node-di implementation details.

## Plugin types

This section outlines API requirements and conventions for different plugin types. There also links to some plugins, which you can use for inspiration.

### Frameworks

- example plugins: [karma-jasmine], [karma-mocha], [karma-requirejs]
- use naming convention is `karma-*`
- use npm keywords `karma-plugin`, `karma-framework`.

A framework connects existing testing libraries to Karma's API, so that their results can be displayed in a browser and sent back to the server.

Karma frameworks _must_ implement a `window.__karma__.start` method that Karma will
call to start test execution. This function is called with an object that has methods
to send results back to karma:

* `.result` a single test has finished
* `.complete` the client completed execution of all the tests
* `.error` an error happened in the client
* `.info` other data (e.g. number of tests or debugging messages)

Most commonly you'll use the `result` method to send individual test success or failure
statuses. The method takes an object of the form:

```js
{
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
```

### Reporters

- example plugins: [karma-growl-reporter], [karma-junit-reporter], [karma-material-reporter]
- use naming convention is `karma-*-reporter`
- use npm keywords `karma-plugin`, `karma-reporter`

### Launchers

- example plugins: [karma-chrome-launcher], [karma-sauce-launcher]
- use naming convention is `karma-*-launcher`
- use npm keywords `karma-plugin`, `karma-launcher`

### Preprocessors

- example plugins: [karma-coffee-preprocessor], [karma-ng-html2js-preprocessor]
- use naming convention is `karma-*-preprocessor`
- user npm keywords `karma-plugin`, `karma-preprocessor`

A preprocessor is a function that accepts three arguments (`content`, `file`, and `next`), mutates the content in some way, and passes it on to the next preprocessor.

- arguments passed to preprocessor plugins:
  - **`content`** of the file being processed
  - **`file`** object describing the file being processed
     - **path:** the current file, mutable file path. e. g. `some/file.coffee` -> `some/file.coffee.js` _This path is mutable and may not actually exist._
     - **originalPath:** the original, unmutated path
     - **encodings:** A mutable, keyed object where the keys are a valid encoding type ('gzip', 'compress', 'br', etc.) and the values are the encoded content. Encoded content should be stored here and not resolved using `next(null, encodedContent)`
     - **type:** determines how to include a file, when serving
  - **`next`** function to be called when preprocessing is complete, should be called as `next(null, processedContent)` or `next(error)`

### Crazier stuff

As Karma is assembled by dependency injection, a plugin can ask for pretty much any Karma component and interact with it. There are a couple of plugins that do more interesting stuff like this, check out [karma-closure], [karma-intellij].

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
[node-di]: https://github.com/vojtajina/node-di
[karma-material-reporter]: https://github.com/ameerthehacker/karma-material-reporter
[plugins]: ../config/plugins.html
