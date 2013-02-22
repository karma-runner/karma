# How to contribute
If you are thinking about making Testacular better, or you just want to hack on it, that’s great! Here
are some tips to get you started.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* Consider [submiting a ticket](https://github.com/vojtajina/testacular/issues/new) for your issue,
  assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you fill in the earliest version that you know has the issue.
  * For smaller tweaks and fixes that you plan to fix yourself and merge back soon, you may skip this step.
    When you submit your pull request, it will serve as your issue.
* Fork the repository on GitHub

## Initial setup
* Clone your fork.  For these instructions, we assume you cloned into '~/github/testacular'.
* Install dependencies:

  ```bash
  $ cd ~/github/testacular
  # install local dependencies
  $ npm install

  # install global dependencies
  $ npm install grunt-cli -g
  ```

* Ensure you have a stable working baseline for development.
  ```bash
  # This will run a full build and test pass.
  $ cd ~/github/testacular
  $ grunt
  ```
  On an unmodified 'master' branch, this command should always complete and report success.

  If `grunt fails:
  * Make sure grunt-0.4 is installed: http://gruntjs.com/getting-started
  * Review the open issues - perhaps this is a known problem that someone else has dealt with before.
  * File an issue (see above)

* Run 'grunt init-dev-env'. This will install a git commit trigger that will ensure your commit messages
    follows the [Testacular - Git Commit Msg Format Conventions]



## Making and Submitting Changes

* Checkout a new branch (usually based on `master`) and name it accordingly to what
  you intend to do
  * Features get the prefix `feature-`
  * Bug fixes get the prefix `fix-`
  * Improvements to the documentation get the prefix `docs-`
  * Use one branch per feature/fix
* Make your changes
  * Follow [node.js style guidelines](http://nodeguide.com/style.html) (with exception of 100 characters
    per line)
  * Add tests for your changes as (or before) you make them, if at all possible.
    We use coffee script for our tests.
* Commit your changes
  * Follow the [Testacular - Git Commit Msg Format Conventions]
  * Push your changes to your forked repository
* Send a pull request to the `master` branch.
  * Before submitting, make sure the default 'grunt' command succeeds locally.
  * After submitting, TravisCI will pick up your changes and report results.
  * Make fixes and incorporate feedback, as needed.

## Build and Test Commands

The default task, just calling `grunt`, will run `build jshint test`.  You may also run tasks separately.

Build the project:
```bash
$ grunt build
```
Lint the files:
```bash
$ grunt jshint
```
Run the tests:
```bash

# All tests
$ grunt test

# Separate test suites
$ grunt test:unit
$ grunt test:e2e
$ grunt test:client
```

# Additional Resources

* [Issue tracker]
* [Mailing List]
* [General GitHub documentation]
* [GitHub pull request documentation]
* [@TestacularJS]

[Testacular - Git Commit Msg Format Conventions]: http://testacular.github.com/0.6.0/dev/git-commit-msg.html
[Issue tracker]: https://github.com/vojtajina/testacular/issues
[Mailing List]: https://groups.google.com/forum/#!forum/testacular
[General GitHub documentation]: http://help.github.com/
[GitHub pull request documentation]: http://help.github.com/send-pull-requests/
[@TestacularJS]: http://twitter.com/TestacularJS
