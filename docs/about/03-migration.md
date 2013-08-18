pageTitle: Migration from v0.8


The good thing is that you don't have to migrate everything at once. You can keep the global Karma and update project by project.

Note: If you are getting "npm ERR! peerinvalid Peer" error. Try removing old version of Karma first.


Let's get started...

First upgrade your local or global install of Karma via the command line using NPM.
```bash
# upgrade local install...
cd <path-to-your-project>
npm install karma

# or upgrade global install...
sudo npm install -g karma
```

## Plugins

All the frameworks, reporters, preprocessors and browser launchers are now separate plugins. Here is a list of all of them including related plugins. So install all the plugins you need:
```bash
npm install karma-<plugin name> --save-dev
```

### Frameworks
- jasmine (`karma-jasmine` ships with Karma)
- mocha   `karma-mocha`
- qunit   `karma-qunit`


### Preprocessors
- coffee    (`karma-coffee-preprocessor` ships with Karma)
- html2js   (`karma-ng-html2js-preprocessor` ships with Karma)
- coverage  `karma-coverage`
- live      `karma-live-preprocessor`

### Reporters
- dots (included, no plugin)
- progress (included, no plugin)
- growl `karma-growl-reporter`
- junit `karma-junit-reporter`
- teamcity `karma-teamcity-reporter`

### Launchers
- Chrome        (`karma-chrome-launcher` ships with Karma)
- Chrome Canary (`karma-chrome-launcher` ships with Karma)
- PhantomJS     (`karma-phantomjs-launcher` ships with Karma)
- Firefox       `karma-firefox-launcher`
- Safari        `karma-safari-launcher`
- IE            `karma-ie-launcher`
- Opera         `karma-opera-launcher`


## New config syntax
The configuration file is now a regular Node module, that exports a single function. This function will get called with a config object:
```javascript
module.exports = function(config) {
  config.set({
    basePath: '.',
    files: [
      // ...
    ]
  })
};
```

Also, remove all the constants like `JASMINE`, `JASMINE_ADAPTER`, `MOCHA`, `MOCHA_ADAPTER`, `QUNIT`, `QUNIT_ADAPTER`, `REQUIRE`, `REQUIRE_ADAPTER`, `ANGULAR_SCENARIO`, `ANGULAR_SCENARIO_ADAPTER` from files and use frameworks config instead:
```javascript
// before
files = [
  JASMINE,
  JASMINE_ADAPTER,
  '*.js'
];

// change to
module.export = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: ['*.js']
  });
};
```

That should be it ;-) If you have any problem, ask on [mailing list](https://groups.google.com/forum/?fromgroups#!forum/karma-users).

You can also check out [migrating AngularJS](https://github.com/angular/angular.js/commit/29f96c852c355d0e283a64111d4923d1bcde8f5f).
