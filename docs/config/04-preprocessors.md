Preprocessors in Testacular allow you to do some work with your files before
they get served to the browser. The configuration of these happens in this block
in the config file.

```javascript
preprocessors = {
  '**/*.coffee': 'coffee',
  '**/*.html': 'html2js'
};
```

## Available Preprocessors
- [coffee]
- [live]
- [html2js]
- [coverage]


## Minimatching
The keys of the preprocessors config object are used to filter the files specified in
the `files` configuration.

* First the file paths are expanded to an absolute path, based on the
  `basePath` config and the directory of the configuration file. See
  [files] for more information on that.
* Second this expanded path is matched using [minimatch] against the
  specified key.

So for example the path `/my/absolute/path/to/test/unit/file.coffee` matched against
the key `**/*.coffee` would return `true`, but matched against just `*.coffee` it would
return `false` and the preprocessor would not be executed on the CoffeeScript files.



[files]: files.html
[minimatch]: https://github.com/isaacs/minimatch
[coffee]: https://github.com/testacular/testacular/blob/v0.5.8/lib/preprocessors/Coffee.js
[live]: https://github.com/testacular/testacular/blob/v0.5.8/lib/preprocessors/Live.js
[html2js]: https://github.com/testacular/testacular/blob/v0.5.8/lib/preprocessors/Html2js.js
[coverage]: https://github.com/testacular/testacular/blob/v0.5.8/lib/preprocessors/Coverage.js
