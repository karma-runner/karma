Karma can be easily extended through plugins. In fact, all the existing preprocessors, reporters, browser launchers and frameworks are plugins. 

You can install [existing plugins] from NPM or you can write [your own plugins][developing plugins] for Karma.

## Installing Plugins

The recommended way to install plugins is to add them as project dependencies in your `package.json`:

```json
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

By default, Karma loads plugins from all sibling NPM packages which have a name starting with `karma-*`.

You can also override this behavior and explicitly list plugins you want to load via the `plugins` configuration setting:

```javascript
config.set({
  plugins: [
    // Load a plugin you installed from NPM.
    require('karma-jasmine'),

    // Load a plugin from the file in your project.
    require('./my-custom-plugin'),
  
    // Define a plugin inline.
    { 'framework:xyz': ['factory', factoryFn] },

    // Specify a module name or path which Karma will require() and load its 
    // default export as a plugin.
    'karma-chrome-launcher',
    './my-fancy-plugin'
  ]
})
```

## Activating Plugins

Adding a plugin to the `plugins` array only makes Karma aware of the plugin, but it does not activate it. Depending on the plugin type you'll need to add a plugin name into `frameworks`, `reporters`, `preprocessors`, `middleware` or `browsers` configuration key to activate it. For the detailed information refer to the corresponding plugin documentation or check out [Developing plugins][developing plugins] guide for more in-depth explanation of how plugins work.

[existing plugins]: https://www.npmjs.com/search?q=keywords:karma-plugin
[developing plugins]: ../dev/plugins.html
