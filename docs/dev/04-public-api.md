Most of the time, you will be using Karma directly from the command line.
You can, however, call Karma programmatically from your node module. Here is the public API.


## karma.Server(options, [callback=process.exit])

### Constructor

```javascript
var Server = require('karma').Server
var server = new Server({port: 9876}, function(exitCode) {
  console.log('Karma has exited with ' + exitCode)
  process.exit(exitCode)
})
```

Notice the capital 'S' on  `require('karma').Server`.

### **server.start()**

Equivalent of `karma start`.

```javascript
server.start()
```

### **server.refreshFiles()**

Trigger a file list refresh. Returns a promise.

```javascript
server.refreshFiles()
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

A test run was completed.

## karma.runner

### **runner.run(options, [callback=process.exit])**

The equivalent of `karma run`.

```javascript
var runner = require('karma').runner
runner.run({port: 9876}, function(exitCode) {
  console.log('Karma has exited with ' + exitCode)
  process.exit(exitCode)
})
```

## karma.stopper

### **stopper.stop(options, [callback=process.exit])**

This function will signal a running server to stop.  The equivalent of `karma stop`.  

```javascript
var stopper = require('karma').stopper
stopper.stop({port: 9876}, function(exitCode) {
  if (exitCode === 0) {
    console.log('Server stop as initiated')
  }
  process.exit(exitCode)
})
```

## karma.config.parseConfig([configFilePath], [cliOptions])

This function will load given config file and returns a filled config object.
This can be useful if you want to integrate karma into another tool and want to load
the karma config while honoring the karma defaults. For example, the [stryker-karma-runner](https://github.com/stryker-mutator/stryker-karma-runner)
uses this to load your karma configuration and use that in the stryker configuration.

```javascript
const cfg = require('karma').config;
const path = require('path');
// Read karma.conf.js, but override port with 1337
const karmaConfig = cfg.parseConfig(path.resolve('./karma.conf.js'), { port: 1337 } );
```

## karma.constants

### **constants.VERSION**

The current version of karma

### **constants.DEFAULT_PORT**

The default port used for the karma server

### **constants.DEFAULT_HOSTNAME**

The default hostname used for the karma server

### **constants.LOG_DISABLE**

The value for disabling logs

### **constants.LOG_ERROR**

The value for the log `error` level

### **constants.LOG_WARN**

The value for the log `warn` level

### **constants.LOG_INFO**

The value for the log `info` level

### **constants.LOG_DEBUG**

The value for the log `debug` level

### **constants.LOG_PRIORITIES**

An array of log levels in descending order, i.e. `LOG_DISABLE`, `LOG_ERROR`, `LOG_WARN`, `LOG_INFO`, and `LOG_DEBUG`

### **constants.COLOR_PATTERN**

The default color pattern for log output

### **constants.NO_COLOR_PATTERN**

The default pattern for log output without color

### **constants.CONSOLE_APPENDER**

The default console appender

### **constants.EXIT_CODE**

The exit code

## Callback function notes

- If there is an error, the error code will be provided as the second parameter to the error callback.
