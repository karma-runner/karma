pageTitle: Ember.js
menuTitle: Ember.js

To execute javascript unit and integration tests with ember.js follow the steps below:

1. [install karma]

2. install the qunit plugin

  ```bash
  npm install karma-qunit --save-dev
  ```

3. install the ember preprocessor plugin

  ```bash
  npm install karma-ember-preprocessor --save-dev
  ```

4. genenerate a configuration file for karma
  ```bash
  karma init
  ```
  note -the above will walk you through the basic setup. An example configuration file that works with ember.js/qunit and phantomjs is below

  ```javascript
  module.exports = function(config) {
    config.set({
      basePath: 'js',

      files: [
        'vendor/jquery/jquery.min.js',
        'vendor/handlebars/handlebars.js',
        'vendor/ember/ember.js',
        'app.js',
        'tests/*.js',
        'templates/*.handlebars'
      ],

      browsers: ['PhantomJS'],
      singleRun: true,
      autoWatch: false,

      frameworks: ['qunit'],

      plugins: [
        'karma-qunit',
        'karma-ember-preprocessor',
        'karma-phantomjs-launcher'
      ],

      preprocessors: {
        '**/*.handlebars': 'ember'
      }
    });
  };
  ```

  Note - the `files` section above should include all dependencies, ie- jQuery/handlebars/ember.js along with the js and handlebars files required to deploy and run your production ember.js application

5. add a simple qunit test

  ```javascript
  test('one should equal one', function() {
      equal(1, 1, 'error: one did not equal one');
  });
  ```

6. run the tests with karma from the command line
  ```bash
  karma start
  ```

A simple unit / integration tested example app showing karma / qunit / ember in action can be found [here]

[install karma]: ../intro/installation.html
[here]: https://github.com/toranb/ember-testing-example
