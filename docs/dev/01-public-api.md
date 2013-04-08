Most of the time, you will be using Karma directly from the command line.

You can, however, call Karma programmatically from your node module. This might be helpful when
using Karma with [Grunt] for instance.



## karma.server

### **server.start(options, [callback=process.exit])**

Equivalent of `karma start`.

```javascript
var server = require('karma').server;
server.start({port: 9877}, function(exitCode) {
  console.log('Karma has exitted with ' + exitCode);
  process.exit(exitCode);
});
```

## karma.runner

### **runner.run(options, [callback=process.exit])**

Equivalent of `karma run`.

```javascript
var runner = require('karma').runner;
runner.run({runnerPort: 9100}, function(exitCode) {
  console.log('Karma has exitted with ' + exitCode);
  process.exit(exitCode);
});
```

[Grunt]: http://gruntjs.com/
