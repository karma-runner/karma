pageTitle: Developing Plugins

Karma can be extended through plugins. A plugin is essentially an NPM module. Typically, there are four kinds of plugins: **frameworks**, **reporters**, **launchers** and **preprocessors**. The best way to understand how this works is to take a look at some of the existing plugins. Following sections list some of the plugins that you might use as a reference.

## Frameworks
- example plugins: [karma-jasmine], [karma-mocha], [karma-requirejs]
- use naming convention is `karma-*`
- use NPM keywords `karma-plugin`, `karma-framework`.

## Reporters
- example plugins: [karma-growl-reporter], [karma-junit-reporter]
- use naming convention is `karma-*-reporter`
- use NPM keywords `karma-plugin`, `karma-reporter`

## Launchers
- example plugins: [karma-chrome-launcher], [karma-sauce-launcher]
- use naming convention is `karma-*-launcher`
- use NPM keywords `karma-plugin`, `karma-launcher`

## Preprocessors
- example plugins: [karma-coffee-preprocessor], [karma-ng-html2js-preprocessor]
- use naming convention is `karma-*-preprocessor`
- user NPM keywords `karma-plugin`, `karma-preprocessor`

## Crazier stuff
Karma is assembled by Dependency Injection and a plugin is just an additional DI module (see [node-di] for more), that can be loaded by Karma. Therefore it can asks for pretty much any Karma component and interact with it. There are couple of plugins that do more interesting stuff like this, check out [karma-closure], [karma-intellij], [karma-dart].


[karma-jasmine]: https://github.com/karma-runner/karma-jasmine
[karma-mocha]: https://github.com/karma-runner/karma-mocha

[karma-requirejs]: https://github.com/karma-runner/karma-requirejs
[karma-growl-reporter]: https://github.com/karma-runner/karma-growl-reporter
[karma-junit-reporter]: https://github.com/karma-runner/karma-junit-reporter
[karma-chrome-launcher]: https://github.com/karma-runner/karma-chrome-launcher
[karma-sauce-launcher]: https://github.com/karma-runner/karma-sauce-launcher
[karma-coffee-preprocessor]: https://github.com/karma-runner/karma-coffee-preprocessor
[karma-ng-html2js-preprocessor]: https://github.com/karma-runner/karma-ng-html2js-preprocessor
[karma-closure]: https://github.com/karma-runner/karma-closure
[karma-intellij]: https://github.com/karma-runner/karma-intellij
[karma-dart]: https://github.com/karma-runner/karma-dart
[node-di]: https://github.com/vojtajina/node-di
