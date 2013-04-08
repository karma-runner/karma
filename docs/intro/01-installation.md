Karma runs on [Node.js] and is available as a node module via [NPM].

## Requirements

First, you need to install [Node.js]. There are installers for both
Mac and Windows. On Linux, we recommend using [NVM].

## Global Installation
This is the recommended way. It will install Karma into your
global `node_modules` directory and create a symlink to its binary.

```bash
$ npm install -g karma

# Start Karma
$ karma start
```

## Local Installation
A local installation will install Karma into your current
directory's `node_modules`. That allows you to have different
versions for different projects.

```bash
$ npm install karma

# Start Karma
$ ./node_modules/.bin/karma start
```


[Node.js]: http://nodejs.org/
[NPM]: https://npmjs.org/
[NVM]: https://github.com/creationix/nvm
