Preprocessors in Karma allow you to do some work with your files before
they get served to the browser. These are configured in the `preprocessors` block
of the configuration file:

```javascript
preprocessors: {
  '**/*.coffee': ['coffee'],
  '**/*.tea': ['coffee'],
  '**/*.html': ['html2js']
},
```
Note the multiple expressions referencing the "coffee" preprocessor, as a preprocessor can be listed more than once,
as another way to specify multiple file path expressions.

Note: Most of the preprocessors need to be loaded as [plugins].

## Available Preprocessors
- [coffee]
- [html2js]
  - Note any .html files listed in the files section must be referenced at run time as `window.__html__['template.html']`. [Learn more](html2js).
  - If this preprocessor is disabled, included .html files will need `base/` added to beginning of their path reference. See [discussion in issue 788][issue788].
- [coverage]
- [ng-html2js]
- [many more](https://www.npmjs.org/browse/keyword/karma-preprocessor)

Here's an example of how to add the CoffeScript preprocessor to your testing suite:

```bash
# Install it first with NPM
$ npm install karma-coffee-preprocessor --save-dev
```

And then inside your configuration file...

```javascript
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.coffee': ['coffee']
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
[custom plugins]: ../dev/plugins.html
[plugins]: plugins.html
[issue788]: https://github.com/karma-runner/karma/issues/788
