# Git Commit Message Convention

Format of the commit message:
```
<type>(<scope>): <subject>

<body>

<footer>
```
## First line
First line cannot be longer than 70 characters, second line is always blank and other lines should be wrapped at 80 characters.

### Allowed `<type>`

   * feat (new feature)
   * fix (bug fix)
   * docs (changes to documentation)
   * style (formatting, missing semi colons, etc; no code change)
   * refactor (refactoring production code)
   * test (adding missing tests, refactoring tests; no production code change)
   * chore (updating grunt tasks etc; no production code change)

### Allowed `<scope>`

Scope describes the component/place, that the change is related to.

* init
* runner
* file-list
* watcher
* config
* web-server
* proxy
* adapter.jasmine
* adapter.mocha
* adapter.qunit
* adapter.requirejs
* adapter.angular-scenario
* preprocessor.html2js
* preprocessor.coffee
* preprocessor.live
* preprocessor.coverage
* reporter.dots
* reporter.progress
* reporter.junit
* reporter.coverage
* reporter.growl
* launcher.chrome

The `<scope>` can be empty (eg. if the change is a global or difficult to assign to a single component), in which case the parentheses are omitted.

## Message body

* uses the imperative, present tense: “change” not “changed” nor “changes”
* includes motivation for the change and contrasts with previous behavior

For more info about message body, see:

* http://365git.tumblr.com/post/3308646748/writing-git-commit-messages
* http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

## Message footer
### Referencing issues

Closed issues should be listed on a separate line in the footer prefixed with "Closes" keyword like this:
```
Closes #234
```
or in case of multiple issues:
```
Closes #123, #245, #992
```
### Breaking changes

All breaking changes have to be mentioned in footer with the description of the change, justification and migration notes.
```
BREAKING CHANGE:

`port-runner` command line option has changed to `runner-port`, so that it is 
consistent with the configuration file syntax.

To migrate your project, change all the commands, where you use `--port-runner` 
to `--runner-port`.
```
This document is based on [AngularJS Git Commit Msg Convention].

[AngularJS Git Commit Msg Convention]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
