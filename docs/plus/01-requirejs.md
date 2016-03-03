pageTitle: RequireJS
menuTitle: RequireJS

To get Karma to run with [Require.js] we need two files:

* `karma.conf.js` &mdash; which configures Karma
* `test-main.js` &mdash; which configures Require.js for the tests

Let's imagine our app has a directory structure which looks something like this:

```bash
$ tree
.
|-- index.html
|-- karma.conf.js
|-- lib
|   |-- jquery.js
|   |-- require.js
|   `-- underscore.js
|-- src
|   |-- app.js
|   `-- main.js
`-- test
    |-- appSpec.js
    `-- test-main.js

3 directories, 9 files
```

## Configure Karma

The first step is creating our `karma.conf.js`. We can do this from the
command line:

```bash
$ karma init
```

This will give you a series of prompts for things such as paths to the source and test
files as well as which browsers to capture.

In this example we'll use Jasmine, but other test frameworks work just
as well.

Choose "yes" for Require.js.

For the question *"Which files do you want to include with &lt;script&gt;
tag?"*, we need to choose all files which are *not* loaded by Require.js.
Usually, you'll only need to include your `test-main.js` file, which has
the same role for your tests as `main.js` has for your app when using
Require.js.

For the question *"What is the location of your source and test files?"*, we choose all the
files we want to load with Require.js. For this example we'll need:

* `lib/**/*.js` &mdash; all external libraries
* `src/**/*.js` &mdash; our source code
* `test/**/*Spec.js` &mdash; all the tests

And then, when excluding files, type in `src/main.js`, as we don't want to actually
start the application in our tests.

Now your `karma.conf.js` should include:

```javascript
// list of files / patterns to load in the browser
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'requirejs'],

    files: [
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*Spec.js', included: false},

      'test/test-main.js'
    ],

    // list of files to exclude
    exclude: [
        'src/main.js'
    ]
  });
};
```

The files property contains every file you want to be available to the
Karma runner. By default a script tag will be created for the files,
unless you use the `included: false` option.

If you want a script tag to be added before requirejs (to load an amd 
compatible script before requirejs) then you must add the requirejs
and adapter script to the files list and remove requirejs from the
frameworks list. This allows you to control the order. For instance
to load `knockout.js` before requirejs...

```
  config.set({
    frameworks: ['jasmine'],

    files: [
      'knockout.js',

      'node_modules/requirejs/require.js',
      'node_modules/karma-requirejs/lib/adapter.js',

      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/**/*Spec.js', included: false},

      'test/test-main.js'
    ],
```

## Configuring Require.js

Just like any Require.js project, you need a main module to bootstrap
your tests. We do this in `test/test-main.js`.

### Karma `/base` Directory

Karma serves files under the `/base` directory. So, on the server
requests to files will be served up under
`http://localhost:9876/base/*`.

The Require.js config for `baseUrl` gives a starting context for modules
that load with relative paths. When setting this value for the Karma
server, it will need to start with `/base`. We want the `baseUrl` for our
tests to be the same folder as the base url we have in `src/main.js`, so
that relative requires in the source won’t need to change. So, as we
want our base url to be at `src/`, we need to write `/base/src`.

### Require Each Test File

With Karma we don't need to list all test files ourselves as we can
easily find them from the files specified in `test-main.js`: Karma
includes all the files in `window.__karma__.files`, so by filtering this
array we find all our test files.

Now we can tell Require.js to load our tests, which must be done
asynchronously as dependencies must be fetched before the tests are run.
The `test/test-main.js` file ends up looking like this:

```javascript
var TEST_REGEXP = /(spec|test)\.js$/i;
var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/src',

  // example of using a couple of path translations (paths), to allow us to refer to different library dependencies, without using relative paths
  paths: {
    'jquery': '../lib/jquery',
    'underscore': '../lib/underscore',
  },

  // example of using a shim, to load non AMD libraries (such as underscore)
  shim: {
    'underscore': {
      exports: '_'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
```

## Using Require.js in tests

Tests can now be written as regular Require.js modules. We wrap
everything in `define`, and inside we can use the regular test methods,
such as `describe` and `it`. Example:

```javascript
define(['app', 'jquery', 'underscore', './test-helper'], function(App, $, _, testHelper) {

    describe('just checking', function() {
    
        testHelper.setup();

        it('works for app', function() {
            var el = $('<div></div>');

            var app = new App(el);
            app.render();

            expect(el.text()).toEqual('require.js up and running');
        });

        it('works for underscore', function() {
            // just checking that _ works
            expect(_.size([1,2,3])).toEqual(3);
        });

    });

});
```

## Running the tests

We can now run the tests from the command line:

```bash
$ karma start
```

If you didn't configure Karma to watch all the files and run tests
automatically on any change, you can trigger the tests manually by
typing:

```bash
$ karma run
```

[Here is a running example of Karma with Require.js][example].

[Require.js]: http://requirejs.org/
[example]: https://github.com/kjbekkelund/karma-requirejs
