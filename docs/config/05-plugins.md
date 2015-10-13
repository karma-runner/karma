Karma can be easily extended through plugins.
In fact, all the existing preprocessors, reporters, browser launchers and frameworks are also plugins.

## Installation

Karma plugins are NPM modules, so the recommended way to install them are as project dependencies in your `package.json`:

```javascript
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-mocha": "~0.0.1",
    "karma-growl-reporter": "~0.0.1",
    "karma-firefox-launcher": "~0.0.1"
  }
}
```

Therefore, a simple way to install a plugin is:

```bash
npm install karma-<plugin name> --save-dev
```


## Loading Plugins
By default, Karma loads all sibling NPM modules which have a name starting with `karma-*`.

You can also explicitly list plugins you want to load via the `plugins` configuration setting. The configuration value can either be
a string (module name), which will be required by Karma, or an object (inlined plugin).

```javascript
plugins: [
  // Karma will require() these plugins
  'karma-jasmine',
  'karma-chrome-launcher'

  // inlined plugins
  {'framework:xyz': ['factory', factoryFn]},
  require('./plugin-required-from-config')
]
```

There are already many [existing plugins]. Of course, you can write [your own plugins] too!

[existing plugins]: https://npmjs.org/browse/keyword/karma-plugin
[your own plugins]: ../dev/plugins.html
