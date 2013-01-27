# Configuration File

In order to serve you well, Testacular needs to know about your project. That's done through a
configuration file.

For an example configuration, see [test/client/testacular.conf.js] which contains most of the
options.

This document contain list of all available options as well as their command line equivalents.



## autoWatch

**Type:** Boolean

**Default:**  `false`

**CLI:** `--auto-watch`, `--no-auto-watch`

**Description:** Enable/disable watching the files and executing the tests
  whenever any file changes.



## basePath

**Type:** String

**Default:** `''`

**Description:**  Base path, that will be used to resolve all relative paths defined in `files` and
`exclude`. If the `basePath` is a relative path, it will be resolved to the `__dirname` of the
configuration file.



## browsers

**Type:** Array

**Default:**  `[]`

**CLI:** `--browsers Chrome,Firefox`

**Possible Values:**

  * `Chrome`
  * `ChromeCanary`
  * `Firefox`
  * `Opera`
  * `Safari`
  * `PhantomJS`

**Description:**
A list of browsers to launch and capture. Once testacular is shut down, it will shut down these
browsers as well. You can capture any browser manually just by opening a url, where Testacular's
web server is listening.

See [config/browsers] for more.



## captureTimeout

**Type:** Number

**Default:** `60000`

**Description:** Timeout for capturing a browser (in ms).

If any browser does not get captured within the timeout, Testacular will kill it and try to launch
it again. After three attempts to capture it, Testacular will give up.



## colors

**Type:** Boolean

**Default:**   `true`

**CLI:** `--colors`, `--no-colors`

**Description:**  Enable / disable colors in the output (reporters and logs).



## exclude

**Type:** Array

**Default:** `[]`

**Description:** List of files/patterns to exclude from loaded files.



## files

**Type:** Array

**Default:** `[]`

**Description:** List of files/patterns to load in the browser.

See [config/files] for more information.



## hostname
**Type:** String

**Default:** `'localhost'`

**Description:** Hostname to be used when capturing browsers.



## logLevel
**Type:** Constant

**Default:** `LOG_INFO`

**CLI:** `--log-level debug`

**Possible values:**

  * `LOG_DISABLE`
  * `LOG_ERROR`
  * `LOG_WARN`
  * `LOG_INFO`
  * `LOG_DEBUG`

**Description:** Level of logging.



## loggers
**Type:** Array

**Default:** `[{type: 'console'}]`

**Description:** A list of log appenders to be used. See [log4js] for more.



## port

**Type:** Number

**Default:** `9876`

**CLI:** `--port 9876`

**Description:** The port where the webserver will be listening.



## preprocessors

**Type:** Object

**Default:** `{'**/*.coffee': 'coffee'}`

**Description:** A map of preprocessors to use. See [config/preprocessors] for more.



## proxies

**Type:** Object

**Default:**   `{}`

**Description:** A map of path-proxy pairs.

For example:

```javascript
proxies =  {
  '/static': 'http://gstatic.com',
  '/web': 'http://localhost:9000'
};
```



## reportSlowerThan

**Type:** Number

**Default:** `0`

**Description:** Testacular will report all the tests that are slower than given time limit (in ms).
This is disabled by default.



## reporters

**Type:** Array

**Default:** `['progress']`

**CLI:** `--reporters progress,growl`

**Possible Values:**

  * `dots`
  * `progress`
  * `junit`
  * `growl`
  * `coverage`

**Description:** A list of reporters to use.



## runnerPort

**Type:** Number

**Default:** `9100`

**CLI:** `--runner-port 9100`

**Description:** The port where the server will be listening. This is only used when you are using
`testacular run`.



## singleRun

**Type:** Boolean

**Default:** `false`

**CLI:** `--single-run`, `no-single-run`

**Description:** Continuous Integration mode.

If `true`, it captures browsers, runs tests and exits with `0` exit code (if all tests passed) or
`1` exit code (if any test failed).



## urlRoot

**Type:** String

**Default:** `'/'`

**Description:** The base url, where Testacular runs.

All the Testacular's urls get prefixed with the `urlRoot`. This is helpful when using proxies, as
sometimes you might want to proxy a url that is already taken by Testacular.



[test/client/testacular.conf.js]: https://github.com/testacular/testacular/blob/master/test/client/testacular.conf.js
[config/files]: 02_files.html
[config/browsers]: 03_browsers.html
[config/preprocessors]: 04_preprocessors.html
[log4js]: https://github.com/nomiddlename/log4js-node
