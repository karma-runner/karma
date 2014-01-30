Karma can be easily extended through plugins.
In fact, all the existing preprocessors, reporters, browser launchers and frameworks are also plugins.

## Installation

Karma plugins are NPM modules, so the recommended way is to keep all the plugins your project requires in `package.json`:

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

Therefore, a simple way how to install a plugin is
```bash
npm install karma-<plugin name> --save-dev
```


## Loading Plugins
By default, Karma loads all sibling NPM modules which names start with `karma-*`.

You can also explicitly list plugins you want to load via the `plugins` configuration setting. The configuration value can either be
a string (module name), which will be required by Karma, or an object (inlined plugin).

```javascript
plugins: [
  // these plugins will be require() by Karma
  'karma-jasmine',
  'karma-chrome-launcher'

  // inlined plugins
  {'framework:xyz', ['factory', factoryFn]},
  require('./plugin-required-from-config')
]
```

There are already many [existing plugins]. Of course, you write [your own plugins] too!

[existing plugins]: https://npmjs.org/browse/keyword/karma-plugin
[your own plugins]: ../dev/plugins.html
