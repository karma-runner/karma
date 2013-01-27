# Travis CI Integration

[Travis CI] is a popular continuous integration service that integrates with your [Github] repository to automatically run your tests when code is pushed. Integration is done by adding a simple [YAML] file to your project root; Travis and Github take care of the rest. Travis results will appear in your Github pull requests and your history is available on their control panel. This article assumes you already have Travis account.

## Setup

1. Create a file in your project root called `.travis.yml` with the following YAML:
   
   ```
   language: node_js
   node_js:
     - 0.8
   ```

2. If you do not already have a `package.json` in your project root create one now. Travis runs `npm test` to trigger your tests so this is where you tell Travis how to run your tests. 

   ```javascript
   // ...snip...
   "dependencies": {
      "coffee-script": "1.4.x"
   },
   "devDependencies": {
     "testacular": "0.4.x",
     "phantomjs": "0.2.x" 
   },
   // ...snip...
   "scripts": {
       "test": "./node_modules/coffee-script/bin/cake test"
   }
   // ...snip...
   ```

   Travis will run `npm install` before every suite so this is your chance to specify any modules your app needs that Travis does not – like Testacular.

   This example uses a [Cake] task to run a suite of tests but you can fire off any executable task in the `test` field. Note that the [Travis environment] doesn't have [CoffeeScript] available globally so you must point to your module's Cake bin.

3. Now it's time to open (or create) `Cakefile` in your project root and add a task to run Testacular. This creates a way to fire your Testacular suite for a single run which can be used any place or time.

   ```coffeescript
   task 'test', 'run all tests suites', ->
   console.log 'Running front-end tests'
     phantom_bin = "PHANTOMJS_BIN=#{__dirname}/node_modules/phantomjs/lib/phantom/bin/phantomjs"
     testacular = "#{__dirname}/node_modules/testacular/bin/testacular"
     browsers = if process.env.TRAVIS then 'PhantomJS' else 'PhantomJS,Chrome'
     options = "--single-run --browsers=#{browsers}"
     exec "#{phantom_bin} #{testacular} start #{__dirname}/tests/testacular.conf.js #{options}", (err, stdout, stderr) ->
       console.error err if err
       console.log stdout
   ```

   While Travis does have [PhantomJS] available in its global root, other CI environments or developers may not so it's a good idea to make sure it's explicitly set before running Testacular.

   Also note that while you can run [GUI apps] in Travis their configuration is beyond this article so the script checks that it's in a Travis environment and sets the browser list to only use PhantomJS.

   Once all configuration is set Testacular is fired off, assuming your Testacular configuration is in `#{__dirname}/tests/testacular.conf.js`. If any errors or encountered they - and the standard logs - are displayed in the Travis control panel.

4. All that's left is to test the Cake task locally to assure it works as advertised, commit the files, push them to Github.

## Notes

* Travis' Node environment has very little available. If the startup process in Travis fails check for missing module information and be sure to add them to your `package.json` dependencies.
* Travis does not run in your local network so any code that attempts to connect to resources should be stubbed out using [Nock].
* There are more options available to your `.travis.yml`, such as running scripts before the install or test run. There are hints in the Travis docs for [GUI apps] configuration.

[Travis CI]: https://travis-ci.org/
[Travis environment]: http://about.travis-ci.org/docs/user/ci-environment/
[CoffeeScript]: http://coffeescript.org/
[Cake]: http://coffeescript.org/documentation/docs/cake.html
[Github]: https://github.com/
[YAML]: http://www.yaml.org/
[PhantomJS]: http://phantomjs.org/
[GUI apps]: http://about.travis-ci.org/docs/user/gui-and-headless-browsers/
[Nock]: https://github.com/flatiron/nock
