Karma runs on [Node.js] and is available via [NPM].

## Requirements

First, you need to install [Node.js](http://nodejs.org/download/). There are installers for both
Mac and Windows. On Linux, we recommend using [NVM].

## Global Installation
This is the recommended way. It will install Karma into your global `node_modules` directory and
create a symlink in your system path, so that you can run `karma` command from any directory.

```bash
$ npm install -g karma
```

Note, that `karma` command always looks for locally installed Karma first and if present,
it uses the local version. This allows you to use different version of Karma per project.

## Local Installation
A local installation will install Karma into your current directory's `node_modules`.

```bash
$ npm install karma --save-dev
```


[Node.js]: http://nodejs.org/
[NPM]: npmjs.org/package/karma
[NVM]: https://github.com/creationix/nvm
