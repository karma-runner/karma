pageTitle: Travis CI
menuTitle: Travis CI

[Travis CI] is a popular continuous integration service that
integrates with your [Github] repository to automatically run your
tests when the code is pushed. Integration is done by adding a simple
[YAML] file to your project root; Travis and Github take care of the
rest. Whenever tested, the Travis results will appear in your Github pull requests and your
history will be available within their control panel. This article assumes you
already have Travis account.

## Configure Travis
Create a file in your project root called `.travis.yml` with the
following YAML content:

```ruby
language: node_js
node_js:
  - "4"
```

## Set up a Test Command
If you do not already have a `package.json` in your project root, create one now. Travis runs `npm test` to trigger your tests, so this
is where you tell Travis how to run your tests.

```json
// ...snip...
"devDependencies": {
  "karma": "~0.12"
},
// ...snip...
"scripts": {
   "test": "karma start --single-run --browsers PhantomJS"
}
// ...snip...
```

Travis will run `npm install` before every suite, so this is your
chance to specify any modules your app needs that Travis does not know
about like Karma.

## Configure Travis with Firefox
Travis supports running a real browser (Firefox) with a virtual
screen. Just update your `.travis.yml` to set up the virtual screen
like this:
```ruby
language: node_js
node_js:
  - "4"
before_script:
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
```

And now, you can run your tests on Firefox, just change the `npm test`
command to
```bash
karma start --browsers Firefox --single-run
```

## Notes

* Travis' Node environment has very little available. If the startup
  process in Travis fails to check for missing module information and be sure to add them to your `package.json` dependencies.
* Travis does not run on your local network so any code that attempts
  to connect to resources should be stubbed out using [Nock].
* There are more options available to your `.travis.yml`, such as
  running scripts before the install or test run. There are hints in
  the Travis docs for [GUI apps] configuration.


[Travis CI]: https://travis-ci.org/
[Github]: https://github.com/
[YAML]: http://www.yaml.org/
[PhantomJS]: http://phantomjs.org/
[GUI apps]: http://about.travis-ci.org/docs/user/gui-and-headless-browsers/
[Nock]: https://github.com/flatiron/nock
