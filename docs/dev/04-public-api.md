Most of the time, you will be using Karma directly from the command line.
You can, however, call Karma programmatically from your node module. Here is the public API.


## karma.Server(options, [callback=process.exit])

### `constructor`

- **Returns:** `Server` instance.

#### Usage

Notice the capital 'S' on  `require('karma').Server`.

##### Deprecated Behavior

The following still works, but the way it behaves is deprecated and will be
changed in a future major version.

```javascript
var Server = require('karma').Server
var karmaConfig = {port: 9876}
var server = new Server(karmaConfig, function(exitCode) {
  console.log('Karma has exited with ' + exitCode)
  process.exit(exitCode)
})
```

##### New Behavior

```javascript
const karma = require('karma')
const parseConfig = karma.config.parseConfig
const Server = karma.Server

parseConfig(
  null,
  { port: 9876 },
  { promiseConfig: true, throwErrors: true }
).then(
  (karmaConfig) => {
    const server = new Server(karmaConfig, function doneCallback(exitCode) {
      console.log('Karma has exited with ' + exitCode)
      process.exit(exitCode)
    })
  },
  (rejectReason) => { /* respond to the rejection reason error */ }
);
```

### `server.start()`

Equivalent of `karma start`.

```javascript
server.start()
```

### `server.refreshFiles()`

Trigger a file list refresh. Returns a promise.

```javascript
server.refreshFiles()
```

### `server.refreshFile(path)`

Trigger a file refresh. Returns a promise.

```javascript
server.refreshFile('src/js/module-dep.js')
```

### Events

The `server` object is an [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#events_class_events_eventemitter). You can simply listen to events like this:

```javascript
server.on('browser_register', function (browser) {
  console.log('A new browser was registered')
})
```

### `listening`
**Arguments:**

* `port`: Port number

Begin accepting connections on the specified port.

### `browser_register`
**Arguments:**

* `browser`: The browser instance

A new browser was opened, but is not ready yet.

### `browser_error`
**Arguments:**

* `browser`: The browser instance
* `error`: The error that occurred

There was an error in this browser instance.

### `browser_start`
**Arguments:**

* `browser`: The browser instance
* `info`: Details about the run

A test run is beginning in this browser.

### `browser_complete`
**Arguments:**

* `browser`: The browser instance
* `result`: Test results

A test run has completed in this browser.

### `browsers_change`
**Arguments:**

* `browsers`: A collection of browser instances

The list of browsers has changed.

### `browsers_ready`

All browsers are ready for execution

### `run_start`
**Arguments:**

* `browsers`: A collection of browser instances on which tests are executed

A test run starts.

### `run_complete`
**Arguments:**

* `browsers`: A collection of browser instances
* `results`: A list of results

This event gets triggered whenever all the browsers, which belong to a test run, finish. For example, on a run that has 3 browsers, one would expect 3 `browser_complete` events before the `run_complete` one.

## karma.runner

### `runner.run(options, [callback=process.exit])`

- **Returns:** `EventEmitter`

The equivalent of `karma run`.

#### Usage

##### Deprecated Behavior

The following still works, but the way it behaves is deprecated and will be
changed in a future major version.

```javascript
var runner = require('karma').runner
runner.run({port: 9876}, function(exitCode) {
  console.log('Karma has exited with ' + exitCode)
  process.exit(exitCode)
})
```

##### New Behavior

```javascript
const karma = require('karma')

karma.config.parseConfig(
  null,
  { port: 9876 },
  { promiseConfig: true, throwErrors: true }
).then(
  (karmaConfig) => {
    karma.runner.run(karmaConfig, function doneCallback(exitCode, possibleErrorCode) {
      console.log('Karma has exited with ' + exitCode)
      process.exit(exitCode)
    })
  },
  (rejectReason) => { /* respond to the rejection reason error */ }
);
```

#### `callback` argument

The callback receives the exit code as the first argument.

If there is an error, the error code will be provided as the second parameter to
the error callback.

#### runner Events

`runner.run()` returns an `EventEmitter` which emits a `progress` event passing
the reporter output as a `Buffer` object.

You may listen for that event to print the reporter output to the console:

```javascript
runner.run({port: 9876}).on('progress', function(data) {
  process.stdout.write(data)
})
```

## karma.stopper

### `stopper.stop(options, [callback=process.exit])`

This function will signal a running server to stop. The equivalent of
`karma stop`.

#### Usage

##### Deprecated Behavior

The following still works, but the way it behaves is deprecated and will be
changed in a future major version.

```javascript
var stopper = require('karma').stopper
stopper.stop({port: 9876}, function(exitCode) {
  if (exitCode === 0) {
    console.log('Server stop as initiated')
  }
  process.exit(exitCode)
})
```

##### New Behavior

```javascript
const karma = require('karma')

karma.config.parseConfig(
  null,
  { port: 9876 },
  { promiseConfig: true, throwErrors: true }
).then(
  (karmaConfig) => {
    karma.stopper.stop(karmaConfig, function doneCallback(exitCode, possibleErrorCode) {
      if (exitCode === 0) {
        console.log('Server stop as initiated')
      }
      process.exit(exitCode)
    })
  },
  (rejectReason) => { /* respond to the rejection reason error */ }
);
```

#### `callback` argument

The callback receives the exit code as the first argument.

If there is an error, the error code will be provided as the second parameter to
the error callback.

## karma.config

### `config.parseConfig([configFilePath], [cliOptions], [parseOptions])`

This function will load given config file and returns a filled config object.
This can be useful if you want to integrate karma into another tool and want to load
the karma config while honoring the karma defaults.

#### Usage

##### Deprecated Behavior

The following still works, but the way it behaves is deprecated and will be
changed in a future major version.

```javascript
const cfg = require('karma').config;
const path = require('path');
// Read karma.conf.js, but override port with 1337
const karmaConfig = cfg.parseConfig(
  path.resolve('./karma.conf.js'),
  { port: 1337 }
);
```

The new behavior in the future will involve throwing exceptions instead of
exiting the process and asynchronous config files will be supported through the
use of promises.

##### New Behavior

```javascript
const cfg = require('karma').config;
const path = require('path');
// Read karma.conf.js, but override port with 1337
cfg.parseConfig(
  path.resolve('./karma.conf.js'),
  { port: 1337 },
  { promiseConfig: true, throwErrors: true }
).then(
  (karmaConfig) => { /* use the config with the public API */ },
  (rejectReason) => { /* respond to the rejection reason error */ }
);
```


#### `configFilePath` argument

- **Type:** String | `null` | `undefined`
- **Default Value:** `undefined`

A string representing a file system path pointing to the config file whose
default export is a function that will be used to set Karma configuration
options. This function will be passed an instance of the `Config` class as its
first argument. If this option is not provided, then only the options provided
by the `cliOptions` argument will be set.

- JavaScript must use CommonJS modules.
- ECMAScript modules are not currently supported by Karma when using
    JavaScript.
    - Other formats, such as TypeScript, may support ECMAScript modules.


#### `cliOptions` argument

- **Type:** Object | `null` | `undefined`
- **Default Value:** `undefined`

An object whose values will take priority over options set in the config file.
The config object passed to function exported by the config file will already
have these options applied. Any changes the config file makes to these options
will effectively be ignored in the final configuration.

Supports all the same options as the config file and is applied using the same
`config.set()` method.

The expected source of this argument is parsed command line options, but 
programatic users may construct this object or leave it out entirely.


#### `parseOptions` argument

- **Type:** Object | `null` | `undefined`
- **Default Value:** `undefined`

`parseOptions` is an object whose properties are configuration options that
allow additional control over parsing and opt-in access to new behaviors or
features.

These options are only related to parsing configuration files and object and are
not related to the configuration of Karma itself.


##### `parseOptions.promiseConfig` option

- **Type:** Boolean
- **Default Value:** `false`

When `parseOptions.promiseConfig === true`, then `parseConfig` will return a
promise instead of a configuration object.

When this option is `true`, then the function exported by the config file may
return a promise. The resolution of that promise indicates that all asynchronous
activity has been completed. Internally, the resolved/fulfilled value is 
ignored. As with synchronous usage, all changes to the config object must be
done with the `config.set()` method.

If the function exported by the config file does not return a promise, then
parsing is completed and an immediately fulfilled promise is returned.

Whether the function exported by the config file returns a promise or not, the
promise returned by `parseConfig()` will resolve with a parsed configuration
object, an instance of the `Config` class, as the value.

_**In most cases, `parseOptions.throwErrors = true` should also be set. This
disables process exiting and allows errors to result in rejected promises.**_


##### `parseOptions.throwErrors` option

- **Type:** Boolean
- **Default Value:** `false`

In the past, `parseConfig()` would call `process.exit(exitCode)` when it
encountered a critical failure. This meant that your own code had no way of
responding to failures before the Node.js process exited.

By passing `parseOptions.throwErrors = true`, `parseConfig()` will disable
process exiting.

For synchronous usage, it will throw an exception instead of exiting the
process. Your code can then catch the exception and respond how ever it needs
to.

If the asynchronous API (`parseOptions.promiseConfig = true`) is being used,
then `parseOptions.throwErrors = true` allows the promise to be rejected
instead of exiting the process.


## `karma.constants`

### `constants.VERSION`

The current version of karma

### `constants.DEFAULT_PORT`

The default port used for the karma server

### `constants.DEFAULT_HOSTNAME`

The default hostname used for the karma server

### `constants.DEFAULT_LISTEN_ADDR`

The default address use for the karma server to listen on

### `constants.LOG_DISABLE`

The value for disabling logs

### `constants.LOG_ERROR`

The value for the log `error` level

### `constants.LOG_WARN`

The value for the log `warn` level

### `constants.LOG_INFO`

The value for the log `info` level

### `constants.LOG_DEBUG`

The value for the log `debug` level

### `constants.LOG_PRIORITIES`

An array of log levels in descending order, i.e. `LOG_DISABLE`, `LOG_ERROR`, `LOG_WARN`, `LOG_INFO`, and `LOG_DEBUG`

### `constants.COLOR_PATTERN`

The default color pattern for log output

### `constants.NO_COLOR_PATTERN`

The default pattern for log output without color

### `constants.CONSOLE_APPENDER`

The default console appender

### `constants.EXIT_CODE`

The exit code
