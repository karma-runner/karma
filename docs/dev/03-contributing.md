If you are thinking about making Karma better, or you just want to hack on it, that’s great!
Here are some tips to get you started.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free)
* [Submit](https://github.com/karma-runner/karma/issues/new) a ticket for your issue, assuming one does not
  already exist.
  * Clearly describe the issue including steps to reproduce when it is a bug.
  * Make sure you fill in the earliest version that you know has the issue.
* Fork the repository on GitHub

## Making Changes
* Clone your fork
```bash
$ git clone git@github.com:<your-username>/karma.git
```
* Init your workspace

```bash
$ ./scripts/init-dev-env.js
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
* Please follow [commit message conventions].
* Send a pull request to the `master` branch.

## Contributor License Agreement
Please sign our Contributor License Agreement (CLA) before sending pull requests.
For any code changes to be accepted, the CLA must be signed. It's a quick process, we promise!
  * For individuals we have a [simple click-through form].
  * For corporations we'll need you to print, sign and one of scan+email, fax or mail [the form].

## Additional Resources

* [Issue tracker](https://github.com/karma-runner/karma/issues)
* [Mailing List](https://groups.google.com/forum/#!forum/karma-users)
* [General GitHub documentation](http://help.github.com/)
* [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
* [@JsKarma](http://twitter.com/JsKarma)

[commit message conventions]: git-commit-msg.html
[simple click-through form]: http://code.google.com/legal/individual-cla-v1.0.html
[the form]: http://code.google.com/legal/corporate-cla-v1.0.html
