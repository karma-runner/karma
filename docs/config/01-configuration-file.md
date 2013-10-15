**In order to serve you well, Karma needs to know about your project in order to test it
and this is done via a configuration file. This page explains how to create such a configuration file.**


Note: Most of the framework adapters, reporters, preprocessors and launchers needs to be loaded as [plugins].


The Karma configuration file can be written in JavaScript or CoffeeScript and is loaded as a regular Node.js module.
Within the configuration file, the configuration code is put together by setting `module.exports` to point to a function
which accepts one argument: the configuration object.

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

To see a more detailed example configuration file, see [test/client/karma.conf.js] which contains most of
the available configuration options.

The rest of the document contains a list of all available configuration options...

## autoWatch
**Type:** Boolean

**Default:**  `false`

**CLI:** `--auto-watch`, `--no-auto-watch`

**Description:** Enable or disable watching files and executing the tests
  whenever one of these files changes.


## autoWatchBatchDelay
**Type:** Number

**Default:**  `250`

**Description:** When Karma is watching the files for changes, it tries to batch
multiple changes into a single run so that the test runner doesn't try to start and restart running
tests more than it should. The configuration setting tells Karma how long to wait (in milliseconds) after any changes
have occurred before starting the test process again.


## basePath
**Type:** String

**Default:** `''`

**Description:** The root path location that will be used to resolve all relative
paths defined in `files` and `exclude`. If the `basePath` configuration is a
relative path then it will be resolved to the `__dirname` of the configuration file.


## browsers
**Type:** Array

**Default:**  `[]`

**CLI:** `--browsers Chrome,Firefox`

**Possible Values:**

  * `Chrome` (comes installed with Karma)
  * `ChromeCanary` (comes installed with Karma)
  * `PhantomJS` (comes installed with Karma)
  * `Firefox` (requires karma-firefox-launcher plugin)
  * `Opera` (requires karma-opera-launcher plugin)
  * `Internet Explorer` (requires karma-ie-launcher plugin)
  * `Safari` (requires karma-safari-launcher plugin)

**Description:** A list of browsers to launch and capture. When Karma starts up, it will also start up each browser
which is placed within this setting.  Once Karma is shut down, it will shut down these
browsers as well. You can capture any browser manually just by opening the browser and visiting the URL where
the Karma web server is listening (by default it is `http://localhost:9876/`).

See [config/browsers] for more. Additional launchers can be defined through [plugins].


## captureTimeout
**Type:** Number

**Default:** `60000`

**Description:** Timeout for capturing a browser (in ms).

The `captureTimeout` value represents the maximum boot-up time allowed for a browser to start and connect to Karma.
If any browser does not get captured within the timeout, Karma will kill it and try to launch
it again and, after three attempts to capture it, Karma will give up.


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

**Description:** List of frameworks you want to use. Typically, you will set this to `['jasmine']`, `['mocha']` or `['qunit']`...

Please note just about all frameworks in Karma require an additional plugin/framework library to be installed (via NPM).

Additional information can be found in [plugins].


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

**Description:** List of plugins to load. A plugin can be a string (in which case it will be required by Karma) or an inlined plugin - Object.
By default, Karma loads all siblink modules, that match `karma-*`.

Please note just about all plugins in Karma require an additional library to be installed (via NPM).

See [plugins] for more information.


## port
**Type:** Number

**Default:** `9876`

**CLI:** `--port 9876`

**Description:** The port where the webserver will be listening.


## preprocessors
**Type:** Object

**Default:** `{'**/*.coffee': 'coffee'}`

**Description:** A map of preprocessors to use.

Preprocessors can be loaded through [plugins]. 

Please note just about all preprocessors in Karma (other than CoffeeScript and some other defaults)
require an additional library to be installed (via NPM).

Click <a href="preprocessors.html">here</a> for more information.


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

**Description:** Whether or not karma or any browsers should raise an error when an inavlid SSL certificate is found.

## reportSlowerThan
**Type:** Number

**Default:** `0`

**Description:** Karma will report all the tests that are slower than given time limit (in ms).
This is disabled by default (since the default value is 0).


## reporters
**Type:** Array

**Default:** `['progress']`

**CLI:** `--reporters progress,growl`

**Possible Values:**

  * `dots`
  * `progress`

**Description:** A list of reporters to use.

Additional reporters, such as `growl`, `junit`, `teamcity` or `coverage` can be loaded through [plugins].

Please note just about all additional reporters in Karma (other than progress) require an additional library to be installed (via NPM).


## singleRun
**Type:** Boolean

**Default:** `false`

**CLI:** `--single-run`, `no-single-run`

**Description:** Continuous Integration mode.

If `true`, Karma will start and capture all configured browsers, run tests and then exit with an exit code of `0` or `1` depending
on whether all tests passed or any tests failed.


## transports
**Type:** Array

**Default:** `['websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling']`

**Description:** An array of allowed transport methods between the browser and testing server. This configuration setting
is handed off to [socket.io](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO) (which manages the communication
between browsers and the testing server).


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
