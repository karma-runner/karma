Most of the time, you will be using Testacular directly from the command line.

You can, however, call Testacular programmatically from your node module. This might be helpful when
using Testacular with [Grunt] for instance.



## testacular.server

### **server.start(options, [callback=process.exit])**

Equivalent of `testacular start`.

```javascript
var server = require('testacular').server;
server.start({port: 9877}, function(exitCode) {
  console.log('Testacular has exitted with ' + exitCode);
  process.exit(exitCode);
});
```

## testacular.runner

### **runner.run(options, [callback=process.exit])**

Equivalent of `testacular run`.

```javascript
var runner = require('testacular').runner;
runner.run({runnerPort: 9100}, function(exitCode) {
  console.log('Testacular has exitted with ' + exitCode);
  process.exit(exitCode);
});
```

[Grunt]: http://gruntjs.com/
