Preprocessors in Karma allow you to do some work with your files before
they get served to the browser. The configuration of these happens in the `preprocessors` block
within the configuration file:

```javascript
preprocessors: {
  '**/*.coffee': ['coffee'],
  '**/*.html': ['html2js']
},
```

Note: Most of the preprocessors needs to be loaded as [plugins].

## Available Preprocessors
These preprocessors/plugins are shipped with Karma by default:
- [coffee]
- [html2js]

Additional preprocessors can be loaded through [plugins], such as:
- [coverage]
- [ng-html2js]
- [ember]

As mentioned above above, only the coffee and html2j preprocessors come bundled with Karma. Therefore, to use additional preprocessors,
simply install the required NPM library first and the installed preprocessor can be used regularly.

Here's an example of how to add the coverage preprocessor to your testing suite:

```bash
# Install it first with NPM
$ npm install karma-coverage --save-dev
```

And then inside your configuration file...

```javascript
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.js': ['coverage']
    }
  });
};
```

Of course, you can write [custom plugins] too!


## Configured Preprocessors
Some of the preprocessors can be also configured:

```javascript
coffeePreprocessor: {
  options: {
    bare: false
  }
}
```

Or define a configured preprocessor:

```javascript
customPreprocessors: {
  bare_coffee: {
    base: 'coffee',
    options: {bare: true}
  }
}
```


## Minimatching
The keys of the preprocessors config object are used to filter the files specified in
the `files` configuration.

* First the file paths are expanded to an absolute path, based on the
  `basePath` configuration and the directory of the configuration file. See
  [files] for more information on that.
* Then the newly expanded path is matched using [minimatch] against the
  specified key.

So for example the path `/my/absolute/path/to/test/unit/file.coffee` matched against
the key `**/*.coffee` would return `true`, but matched against just `*.coffee` it would
return `false` and the preprocessor would not be executed on the CoffeeScript files.



[files]: files.html
[minimatch]: https://github.com/isaacs/minimatch
[coffee]: https://github.com/karma-runner/karma-coffee-preprocessor
[html2js]: https://github.com/karma-runner/karma-html2js-preprocessor
[ng-html2js]: https://github.com/karma-runner/karma-ng-html2js-preprocessor
[coverage]: https://github.com/karma-runner/karma-coverage
[ember]: https://github.com/karma-runner/karma-ember-preprocessor
[custom plugins]: ../dev/plugins.html
[plugins]: plugins.html
