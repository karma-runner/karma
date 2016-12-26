pageTitle: Semaphore CI
menuTitle: Semaphore CI

[Semaphore] is a popular continuous integration service that
supports a [wide range of programming languages]. Up-to-date 
versions of [Firefox], [PhantomJS] and [Node.js] make it a good 
testing ground for JavaScript applications. This article assumes 
you already have a Semaphore account.

## Configure Your Project

If you do not already have a `package.json` in your project root,
create one now. This will both document your configuration and
make it easy to run your tests. Here's an example:

```json
// ...snip...
"devDependencies": {
  "karma": "~0.10"
},
// ...snip...
"scripts": {
   "test": "./node_modules/.bin/karma start --single-run --browsers PhantomJS"
}
// ...snip...
```

Another option is to use Firefox as your test browser. To do this, change
the last part to:

```json
"scripts": {
   "test": "./node_modules/.bin/karma start --single-run --browsers Firefox"
}
```

Now running `npm test` within your project will run your tests with Karma.

## Add Your Project to Semaphore

Follow the process as shown in the [screencast] on the Semaphore docs.

After the analysis is finished, ignore the Ruby version Semaphore has set
for you, choose to customize your build commands and use these:

```bash
npm install
npm test
```

That's it - proceed to your first build. In case you're using Firefox as
your test browser, Semaphore will automatically run it on a virtual screen
during your builds.

Also, if necessary, build commands can be further [customized] at any time.


[screencast]: https://semaphoreci.com/docs/adding-github-bitbucket-project-to-semaphore.html
[Semaphore]: https://semaphoreci.com
[wide range of programming languages]: https://semaphoreci.com/docs/supported-stack.html
[Firefox]: https://semaphoreci.com/docs/firefox.html
[PhantomJS]: https://semaphoreci.com/docs/phantomjs.html
[Node.js]: https://semaphoreci.com/docs/languages/javascript/javascript-support-on-semaphore.html
[platform]: https://semaphoreci.com/docs/supported-stack.html
[customized]: https://semaphoreci.com/docs/customizing-build-commands.html
