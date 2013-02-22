If you are thinking about making Testacular better, or you just want to hack on it, that’s great here
are some tips to get you started.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* [Submit](https://github.com/testacular/testacular/issues/new) a ticket for your issue, assuming one does not
  already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you fill in the earliest version that you know has the issue.
* Fork the repository on GitHub

## Making Changes
* Clone your fork
* Install dependencies via

  ```bash
  $ npm install
  ```
* Install global dependencies via
```bash
$ npm install grunt-cli -g
```
* Checkout a new branch (usually based on `master`) and name it accordingly to what
  you intend to do
  * Features get the prefix `feature-`
  * Bug fixes get the prefix `fix-`
  * Improvements to the documentation get the prefix `docs-`

## Testing and Building
Run the tests via
```bash
# All tests
$ grunt test

$ grunt test:unit
$ grunt test:e2e
$ grunt test:client
```
Lint the files via
```bash
$ grunt lint
```
Build the project via
```bash
$ grunt build
```
The default task, just calling `grunt` will run `build lint test`.

If grunt fails, make sure grunt-0.4x is installed: https://github.com/gruntjs/grunt/wiki/Getting-started.

## Submitting Changes

* One branch per feature/fix
* Follow  http://nodeguide.com/style.html (with exception of 100 characters per line)
* Send a pull request to the `master` branch.


## Additional Resources

* [Issue tracker](https://github.com/testacular/testacular/issues)
* [Mailing List](https://groups.google.com/forum/#!forum/testacular)
* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
* [@TestacularJS](http://twitter.com/TestacularJS)
