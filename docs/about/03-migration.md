pageTitle: Migration from v0.10


The good thing is that you don't have to migrate everything at once.
You can leave all the existing projects using an older version of Karma and only use the latest
version for the new projects. Or you can migrate the existing projects one at the time...


Anyway, this migration should be easy ;-) so let's get started...

```bash
cd <path-to-your-project>
npm install karma --save-dev
```
This will install the latest version of Karma and also update `package.json` of your project.


## Install missing plugins
Karma does not ship with any "default" plugin anymore.
For existing projects, this should not cause any problems as NPM (when installing Karma 0.10) probably added these "default" plugins into `package.json` as regular dependencies.
For new projects, just remember you have to install all the plugins you need. These are the "default" plugins that were removed:
- karma-jasmine
- karma-requirejs
- karma-coffee-preprocessor
- karma-html2js-preprocessor
- karma-chrome-launcher
- karma-firefox-launcher
- karma-phantomjs-launcher
- karma-script-launcher


## Install CLI interface
Karma does not put the `karma` command in your system PATH anymore.
If you want to use the `karma` command, please install the command line interface (`karma-cli`).

You probably have `karma` package installed globally, in which case you should remove it first:
```bash
npm remove -g karma
```

And then install the command line interface:
```bash
npm install -g karma-cli
```


## Default configuration
`autoWatch` is true by default, so if you don't wanna use it make sure you set it to `false`. But hey, give it a shot first, it's really awesome to run your tests on every save!


## NPM complaining
NPM is sometimes finicky so if you encounter errors such as "unsatisfied peer dependency", just try to remove all the packages (`rm -rf ./node_modules`) and install again.

If you have any other issuses, please ask on the [mailing list].


[mailing list]: https://groups.google.com/forum/?fromgroups#!forum/karma-users
