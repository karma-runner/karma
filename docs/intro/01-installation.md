Testacular runs on [Node.js] and is available as a node module via [NPM].

## Requirements

First, you need to install [Node.js]. There are installers for both
Mac and Windows. On Linux, we recommend using [NVM].

## Global Installation
This is the recommended way. It will install Testacular into your
global `node_modules` directory and create a symlink to its binary.

```bash
$ npm install -g testacular

# Start Testacular
$ testacular start
```

## Local Installation
A local installation will install Testacular into your current
directory's `node_modules`. That allows you to have different
versions for different projects.

```bash
$ npm install testacular

# Start Testacular
$ ./node_modules/.bin/testacular start
```


[Node.js]: http://nodejs.org/
[NPM]: https://npmjs.org/
[NVM]: https://github.com/creationix/nvm
