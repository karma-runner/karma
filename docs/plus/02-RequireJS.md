This page shows how to configure a project that uses [RequireJS]. It is based on Jake's [post].

## Configure Testacular

### Directory Setup

For clarity in the example configuration files and test below, the
directory structure upon which these are based looks like this:
```bash
project/
  lib/
    jquery.js #etc
  node_modules/
    chai/ #etc
  src/
    MyModule.js
  test/
    MyModule.test.js
    test-main.js
testacular.conf.js
```

### Initialize Testacular

Testacular comes with a nice utility for generating a config file
(default name: `testacular.conf.js`) that it needs in order to run.

In your terminal, type:
```bash
$ testacular init
```
This will give you a series of prompts for things such as paths to
source and tests and which browsers to capture.

### RequireJs Shim
Not immediately apparent is the fact that the ‘shim’ config from
RequireJs 2.x does not work from within Testacular. I haven’t yet
figured out why. For instance, I was constantly getting `‘Backbone’ is
not defined` messages even though it was specified in the ‘shim’
config and required in the test. I could have been doing something
wrong. My solution thus far has been to list each of the non-RequireJs
modules and their dependencies in the `files` attribute of
`testacular.conf.js`.

### `testacular.conf.js`
The final point is that the RequireJs main module for your test runner
should be the last file listed.

So, finally, here is the ‘file’ excerpt of `testacular.conf.js`:
```javascript
files = [
  MOCHA,
  MOCHA_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,

  // libs required for test framework
  {pattern: 'node_modules/chai/chai.js', included: false},

  // put what used to be in your requirejs 'shim' config here,
  // these files will be included without requirejs
  'lib/jquery.js',
  'lib/underscore.js',
  'lib/backbone.js',
  'lib/handlebars.js',

  // put all libs in requirejs 'paths' config here (included: false)
  {pattern: 'lib/**/*.js', included: false},

  // all src and test modules (included: false)
  {pattern: 'src/**/*', included: false},
  {pattern: 'test/**/*.test.js', included: false},

  // test main require module last
  'test/test-main.js'
];
```
This config is awesome. It replaces an html test runner that you would otherwise have to build.

## RequireJs Main Module
Just like any RequireJs project, you need a main module to bootstrap
your tests. In the main module, you setup the `require.config`.

### Testacular `/base` Directory
Testacular serves files under the `/base` directory. So, on the
server, requests to files will be served up under
`http://localhost:9876/base/*`. The RequireJs config for `baseUrl`
gives a starting context for modules that load with relative paths.
When setting this value for the Testacular server, it will need to
start with `/base`. I want my baseUrl to be at the root of my `/src`
directory so relative requires in the source won’t need to change. My
baseUrl has the value of `/base/src`.

### Require Each Test File
One of the things I hate is having to update a master list of all
tests to run every time I add a test. There is no config option for
this, but there's an easy way to get around it by filtering the tests
from the `window.__testacular__.files` object.
The code is included in the example below and the original suggestion
came from <https://github.com/testacular/testacular/pull/236>.

### Asynchronously Run Testacular
Because the RequireJs require statements are asynchronous, Testacular
needs to wait until they’re done (the code is loaded and ready) before
it starts the tests.

The main-test.js file ends up looking like this:
```javascript
var tests = Object.keys(window.__testacular__.files).filter(function (file) {
  return /\.test\.js$/.test(file);
});

require({
  // Testacular serves files from '/base'
  baseUrl: '/base/src',
  paths: {
    require: '../lib/require',
    text: '../lib/text'
  },
  // ask requirejs to load these files (all our tests)
  deps: tests,
  // start test run, once requirejs is done
  callback: window.__testacular__.start
});
```

## RequireJs Test in Testacular
All the setup thus far has been in preparation for the code to follow.
The test can now be setup as a RequireJs module. It can require the
source code under test. It can use Mocha (or whatever framework there
is a Testacular adapter for).

I will also use Chai in order to get the ‘should’ BDD-style
assertions. Note that by using RequireJs and running in the browser,
we can’t just `require('chai')`. It has to be required using the
asynchronous callback to avoid this error:
```bash
Uncaught Error: Module name “../node_modules/chai/chai” has not been loaded yet for context: _. Use require([])
```
And finally, `should()` must be invoked to be available in the test.

So, a simple test will look like:
```javascript
define(['../node_modules/chai/chai', 'MyModule'], function(chai, MyModule) {

  var should = chai.should();

  describe('MyModule', function () {
    describe('#initialize()', function () {
      it('should be a stinkin object', function () {
        var yippee = new MyModule();
        yippee.should.be.an('object');
      });
    });
  });
});
```

## Run the Tests in Testacular
To start the Testacular server:
```bash
$ testacular start
```

If you didn't configure to watch all the files and run tests automatically on any change, you can trigger the tests manually. Just type:
```bash
$ testacular run
```



[RequireJS]: http://requirejs.org/
[post]: http://jaketrent.com/post/test-requirejs-testacular/
