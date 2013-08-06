pageTitle: Semaphore CI
menuTitle: Semaphore CI

[Semaphore] is a popular continuous integration service for
Ruby developers that [integrates] with [GitHub]. It also includes
[Node.js], [PhantomJS] and headless Firefox in its [platform],
making it fit for testing JavaScript applications as well.
This article assumes you already have a Semaphore account.

## Configure Your Project

If you do not already have a `package.json` in your project root,
create one now. This will both document your configuration and
make it easy to run your tests. Here's an example:

```javascript
// ...snip...
'devDependencies': {
  'karma': '~0.10'
},
// ...snip...
'scripts': {
   'test': './node_modules/.bin/karma start --single-run --browsers PhantomJS'
}
// ...snip...
```

Another option is to use Firefox as your test browser. To do this, change
the last part to:

```javascript
'scripts': {
   'test': './node_modules/.bin/karma start --single-run --browsers Firefox'
}
```

Now running `npm test` within your project will run your tests with Karma.

## Add Your Project to Semaphore

Follow the process as shown in the [screencast] on the Semaphore homepage.

After the analysis is finished, ignore the Ruby version Semaphore has set
for you, choose to customize your build commands and use these:

```bash
npm install
npm test
```

That's it - proceed to your first build. In case you're using Firefox as
your test browser, Semaphore will automatically run it in a virtual screen
during your builds.

Also, if necessary, build commands can be further [customized] at any time.


[screencast]: https://semaphoreapp.com/
[Semaphore]: https://semaphoreapp.com
[integrates]: https://semaphoreapp.com/features
[Github]: https://github.com/
[Node.js]: http://nodejs.org
[PhantomJS]: http://phantomjs.org/
[platform]: http://docs.semaphoreapp.com/version-information
[customized]: http://docs.semaphoreapp.com/custom-build-commands
