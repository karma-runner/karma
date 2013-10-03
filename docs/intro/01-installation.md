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

## Global "System-Wide" Installation
This is the recommended approach to installing and making use of Karma. It will install Karma into your global
`node_modules` directory and create a symlink in your system path, so that you can run the `karma`
command from any directory. This means that the `karma` command (which is the central command that Karma uses to run
tests) can be executed anywhere via the command line.

The following command will install Karma globally:

```bash
$ npm install -g karma
```

Please note, that the `karma` command will always look for a locally installed instance of Karma first and
before resorting to a global install and, if present, then the local version will be utilized.
This allows you to use different version of Karma per project.

## Local Installation
A local installation will install Karma into your current directory's `node_modules`.

```bash
$ npm install karma --save-dev
```

The karma command can now be also executed directly from the node_modules directory:

```bash
$ ./node_modules/.bin/karma
```


[Node.js]: http://nodejs.org/
[NPM]: npmjs.org/package/karma
[NVM]: https://github.com/creationix/nvm
