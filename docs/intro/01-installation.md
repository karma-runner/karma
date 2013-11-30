Karma runs on [Node.js] and is available via [NPM].

## Requirements

<ol>
  <li>
    <h3><a href="http://nodejs.org/download/">Node.js</a></h3>
    <p>
      There are installers for both Mac and Windows. On Linux, we recommend using
      <a href="https://github.com/creationix/nvm">NVM</a>.
    </p>
  </li>
  <li>
    <h3><a href="https://npmjs.org/">Node Package Manager (NPM)</a></h3>
    <p>
      NPM is a package manager for Node.js which is used to install Karma. This should
      automatically be installed when Node.js is installed, but if not then please install
      it afterwards.
    </p>
  </li>
</ol>

## Installing Karma and plugins

The recommended approach is to install Karma (and all the plugins your project needs) locally in
the project's directory:

```bash
# Install Karma:
$ npm install karma --save-dev

# Install plugins that your project needs:
$ npm install karma-jasmine karma-chrome-launcher --save-dev

```

This will install Karma and `karma-jasmine` and `karma-chrome-launcher` plugins into your current
directory's `node_modules` and also save these as devDependencies in `package.json`, so that any
other developer working on the project will only have to do `npm install` in order to get all the
dependencies.

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
