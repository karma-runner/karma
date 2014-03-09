Karma runs on [Node.js] and is available as an [NPM] package.

## Installing Node.js

There are [installers](http://nodejs.org/download/) for both Mac and Windows.
On Linux, we recommend using [NVM](https://github.com/creationix/nvm).

Note: Karma works on the two latest stable versions. That is **0.8.x** and **0.10.x** at this point.


## Installing Karma and plugins

The recommended approach is to install Karma (and all the plugins your project needs) locally in
the project's directory.

```bash
# Install Karma:
$ npm install karma --save-dev

# Install plugins that your project needs:
$ npm install karma-jasmine karma-chrome-launcher --save-dev

```

This will install `karma`, `karma-jasmine` and `karma-chrome-launcher` packages into `node_modules` in your current
working directory and also save these as `devDependencies` in `package.json`, so that any
other developer working on the project will only have to do `npm install` in order to get all these
dependencies installed.

```bash
# Run Karma:
$ ./node_modules/karma/bin/karma start
```

## Commandline Interface
Typing `./node_modules/karma/bin/karma start` sucks and so you might find it useful to install `karma-cli` globally.

```bash
$ npm install -g karma-cli
```

Then, you can run Karma simply by `karma` from anywhere and it will always run the local version.


[Node.js]: http://nodejs.org/
[NPM]: npmjs.org/package/karma
[NVM]: https://github.com/creationix/nvm
