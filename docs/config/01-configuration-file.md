In order to serve you well, Karma needs to know about your
project. That's done through a configuration file.

Karma configuration file is a written in JavaScript or CoffeeScript and it is loaded as a regular Node module - using [require()](http://nodejs.org/api/modules.html#modules_module_require_id). It is expected to export a function which accepts one argument - a configuration object:

```javascript
// an example karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    //...
  });
};
```

```coffeescript
# an example karma.conf.coffee
module.exports = (config) ->
  config.set
    basePath: '../..'
    frameworks: ['jasmine']
    # ...
```

For an example configuration, see [test/client/karma.conf.js] which contains most of the available options.

This document contains a list of all available options, as well as their command line equivalents.

## autoWatch
**Type:** Boolean

**Default:**  `false`

**CLI:** `--auto-watch`, `--no-auto-watch`

**Description:** Enable or disable watching files and executing the tests
  whenever one of these files changes.


## basePath
**Type:** String

**Default:** `''`

**Description:**  Base path, that will be used to resolve all relative
  paths defined in `files` and `exclude`. If `basePath` is a
  relative path, it will be resolved to the `__dirname` of the
  configuration file.


## browsers
**Type:** Array

**Default:**  `[]`

**CLI:** `--browsers Chrome,Firefox`

**Possible Values:**

  * `Chrome`
  * `ChromeCanary`
  * `PhantomJS`
  * `Firefox` (requires karma-firefox-launcher plugin)
  * `Opera` (requires karma-opera-launcher plugin)
  * `Safari` (requires karma-ie-launcher plugin)

**Description:**
  A list of browsers to launch and capture. Once Karma is shut down, it will shut down these
  browsers as well. You can capture any browser manually just by opening a url, where Karma's
  web server is listening.

See [config/browsers] for more. Additional launchers can be defined through [plugins].


## captureTimeout
**Type:** Number

**Default:** `60000`

**Description:** Timeout for capturing a browser (in ms).

If any browser does not get captured within the timeout, Karma will kill it and try to launch
it again. After three attempts to capture it, Karma will give up.


## colors
**Type:** Boolean

**Default:**   `true`

**CLI:** `--colors`, `--no-colors`

**Description:**  Enable or disable colors in the output (reporters and logs).


## exclude
**Type:** Array

**Default:** `[]`

**Description:** List of files/patterns to exclude from loaded files.


## files
**Type:** Array

**Default:** `[]`

**Description:** List of files/patterns to load in the browser.

See [config/files] for more information.


## frameworks
**Type:** Array

**Default:** `[]`

**Description:** List of frameworks you wanna use. Typically, you will set this to `['jasmine']`, `['mocha']` or `['qunit']`.

Additional frameworks can be loaded through [plugins].


## hostname
**Type:** String

**Default:** `'localhost'`

**Description:** Hostname to be used when capturing browsers.


## logLevel
**Type:** Constant

**Default:** `config.LOG_INFO`

**CLI:** `--log-level debug`

**Possible values:**

  * `config.LOG_DISABLE`
  * `config.LOG_ERROR`
  * `config.LOG_WARN`
  * `config.LOG_INFO`
  * `config.LOG_DEBUG`

**Description:** Level of logging.


## loggers
**Type:** Array

**Default:** `[{type: 'console'}]`

**Description:** A list of log appenders to be used. See the
  documentation for [log4js] for more information.


## plugins
**Type:** Array

**Default:** `['karma-*']`

**Description:** List of plugins to load. A plugin can be a string (in which case it will be required by Karma) or an inlined plugin - Object. By default, Karma loads all siblink modules, that match `karma-*`. See [plugins] for more information.


## port
**Type:** Number

**Default:** `9876`

**CLI:** `--port 9876`

**Description:** The port where the webserver will be listening.


## preprocessors
**Type:** Object

**Default:** `{'**/*.coffee': 'coffee'}`

**Description:** A map of preprocessors to use.

Preprocessors can be loaded through [plugins]. See [config/preprocessors] for more.


## proxies
**Type:** Object

**Default:**   `{}`

**Description:** A map of path-proxy pairs.

**Example:**
  ```javascript
  proxies:  {
    '/static': 'http://gstatic.com',
    '/web': 'http://localhost:9000'
  },
  ```

## proxyValidateSSL
**Type:** Boolean

**Default:**   `true`

**Description:** Should https proxies error on invalid SSL certificate?

## reportSlowerThan
**Type:** Number

**Default:** `0`

**Description:** Karma will report all the tests that are slower than given time limit (in ms).
This is disabled by default.


## reporters
**Type:** Array

**Default:** `['progress']`

**CLI:** `--reporters progress,growl`

**Possible Values:**

  * `dots`
  * `progress`

**Description:** A list of reporters to use.

Additional reporters, such as `growl`, `junit`, `teamcity` or `coverage` can be loaded through [plugins].


## singleRun
**Type:** Boolean

**Default:** `false`

**CLI:** `--single-run`, `no-single-run`

**Description:** Continuous Integration mode.

If `true`, it captures browsers, runs tests and exits with `0` exit code (if all tests passed) or
`1` exit code (if any test failed).


## transports
**Type:** Array

**Default:** `['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling']`

**Description:** An array of allowed transport methods between the server and the client. This is configuration of [socket.io](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO).


## urlRoot
**Type:** String

**Default:** `'/'`

**Description:** The base url, where Karma runs.

All the Karma's urls get prefixed with the `urlRoot`. This is helpful when using proxies, as
sometimes you might want to proxy a url that is already taken by Karma.


[plugins]: plugins.html
[test/client/karma.conf.js]: https://github.com/karma-runner/karma/blob/master/test/client/karma.conf.js
[config/files]: files.html
[config/browsers]: browsers.html
[config/preprocessors]: preprocessors.html
[log4js]: https://github.com/nomiddlename/log4js-node
