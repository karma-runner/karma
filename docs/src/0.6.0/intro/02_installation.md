# Installation

Testacular runs on [Node.js] and is available as a node module via [NPM].

## Requirements

First, you need to install [Node.js]. There are installers for both
Macintosh and Windows. On Linux, we recommend using [NVM].

## Global instalalation
This is the recommended way. It will install Testacular into your global `node_modules` and create a symlink to its binary.

```bash
$ npm install -g testacular

# start testacular...
$ testacular start
```

## Local instalalation
Local installation will install Testacular into your current directory's `node_modules`. That allows you to have a different version for different project.

```bash
$ npm install testacular

# starting testacular
$ ./node_modules/.bin/testacular start
```


[Node.js]: http://nodejs.org/
[NPM]: https://npmjs.org/
[NVM]: https://github.com/creationix/nvm
