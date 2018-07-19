<!---
TODO:
- add more info about updating PR
  - rebasing/squashing changes
  - making sure Travis is green
- how to run tests on sauce labs
- how to set up plugins
-->

If you are thinking about making Karma better, or you just want to hack on it, that’s great!
Here are some tips on how to set up a Karma workspace and how to send a good pull request.
**Please note we enforce [commit message conventions].**

## Setting up the Workspace

* Make sure you have a [GitHub account](https://github.com/signup/free).
* [Fork the repository] on GitHub.
* Clone your fork
  ```bash
  $ git clone https://github.com/<your-username>/karma.git
  $ cd karma
  ```
* Install for development. Use a recent npm version, ignore peerdep warnings
  ```bash
  $ npm install
  $ rm -rf node_modules/karma
  $ cd node_modules
  $ ln -s ../ karma
  $ cd ../
  $ grunt browserify
  ```

## Testing and Building
- Run the tests via:
  ```bash
  $ npm test
  # or if you have grunt-cli installed globally you can also
  $ grunt test:unit
  $ grunt test:e2e
  $ grunt test:client

  # All tests.
  $ grunt test
  ```

- Lint the code via:
  ```bash
  $ npm run lint
  ```

- Build the client code via:
  ```bash
  $ npm build
  ```

## Changing the Code
Checkout a new branch and name it accordingly to what you intend to do:
- Features get the prefix `feature-`.
- Bug fixes get the prefix `fix-`.
- Improvements to the documentation get the prefix `docs-`.
```bash
$ git checkout -b <branch_name>
```

Open your favorite editor, make some changes, run the tests, change the code, run the tests,
change the code, run the tests, etc.

- Please follow http://nodeguide.com/style.html (with exception of 100 characters per line).


## Sending a Pull Request

- Commit your changes (**please follow our [commit message conventions]**):
  ```bash
  $ git commit -m "..."
  ```
- Push to your github repo:
  ```bash
  $ git push origin <branch_name>
  ```
- Go to the GitHub page and click "Open a Pull request".
- Write a good description of the change.

After sending a pull request, other developers will review and discuss your change.
Please address all the comments. Once everything is all right, one of the maintainers will merge
your changes in.


## Contributor License Agreement
Please sign our Contributor License Agreement (CLA) before sending pull requests.
For any code changes to be accepted, the CLA must be signed. It's a quick process, we promise!
- For individuals, we have a [simple click-through form].
- For corporations we'll need you to print, sign and one of scan+email, fax or mail [the form].

## Additional Resources

- [Mailing List](https://groups.google.com/forum/#!forum/karma-users)
- [Issue tracker](https://github.com/karma-runner/karma/issues)
- [General GitHub documentation](http://help.github.com/)
- [GitHub pull request documentation](http://help.github.com/send-pull-requests/)

[commit message conventions]: git-commit-msg.html
[simple click-through form]: http://code.google.com/legal/individual-cla-v1.0.html
[the form]: http://code.google.com/legal/corporate-cla-v1.0.html
[Fork the repository]: https://github.com/karma-runner/karma/fork
