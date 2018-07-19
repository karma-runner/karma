Karma runs on [Node.js] and is available as an [NPM] package.

## Installing Node.js

On Mac or Linux we recommend using [NVM](https://github.com/creationix/nvm). On Windows, download Node.js
from [the official site](https://nodejs.org/) or use the [NVM PowerShell Module](https://www.powershellgallery.com/packages/nvm).

Note: Karma currently works on Node.js **4.x**, **5.x**, **6.x**, **7.x**, and **8.x**. See [FAQ] for more info.

## Installing Karma and plugins

The recommended approach is to install Karma (and all the plugins your project needs) locally in
the project's directory.

```bash
# Install Karma:
$ npm install karma --save-dev

# Install plugins that your project needs:
$ npm install karma-jasmine karma-chrome-launcher jasmine-core --save-dev

```

This will install `karma`, `karma-jasmine`, `karma-chrome-launcher` and `jasmine-core` packages into `node_modules` in your current
working directory and also save these as `devDependencies` in `package.json`, so that any
other developer working on the project will only have to do `npm install` in order to get all these
dependencies installed.

```bash
# Run Karma:
$ ./node_modules/karma/bin/karma start
```

## Commandline Interface
Typing `./node_modules/karma/bin/karma start` sucks and so you might find it useful to install `karma-cli` globally. You will need to do this if you want to run Karma on Windows from the command line.

```bash
$ npm install -g karma-cli
```

Then, you can run Karma simply by `karma` from anywhere and it will always run the local version.


[Node.js]: http://nodejs.org/
[NPM]: https://npmjs.org/package/karma
[NVM]: https://github.com/creationix/nvm
[FAQ]: ./faq.html
