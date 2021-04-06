pageTitle: Troubleshooting
menuTitle: Troubleshooting

karma has an extensive set of tests and we have limited time to help with bugs. Here are some suggestions to get you unstuck.

### npm audit vulnerabilities
Please open a Pull Request that will fix the issue.

We get lots of these reports, from multiple automated services, from other projects, and from users. The vast majority are minor: please open a pull request if you want a fix. We only take direct action to fix serious issues that affect online users.

### How Do I Debug a karma issue?

Many issues can be solved by reading the `debug log` or by using the `browsers devtools`:

#### Use `--log-level debug` to investigate server-side issues, especially configuration issues.
The `DEBUG` log includes a copy of the final 'config': note that plugins can alter the config and sometimes the settings you applied do not give the result you expected. The log includes both core `karma` lines and lines from plugins: use the logging prefix to determine if your issue may need to be reported to a karma plugin.

#### Use `--no-single-run` to investigate browser-side issues, especially global errors in test files.
The `--no-single-run` option causes the server to print a URL and wait.  Open the URL in a browser and use the browsers devtools to investigate the problem. Typically you will want to open the URL, then click the DEBUG link in the upper right corner. That opens a new window with cleaner code for debugging.

#### Is your issue related to another tool?
Issues with Angular setups are probably better debugged by consulting with other Angular users.  Issues with coverage are probably related to your config, the compiler for coverage instrumentation, or possibly karma-coverage.

#### Use the source!
`karma` is all JavaScript code: perhaps you can debug your issue by adding logging?

### I'm getting an error during the installation related to the ```ws``` module, how can I solve it?
This is a common Windows [issue](https://github.com/einaros/ws/issues/178), the compilation of the native [ws](https://www.npmjs.com/package/ws) module fails. Anyways, ```ws``` has a fallback JS implementation which NPM should take care using it. All you need to do is make sure that you're using an up-to-date version of NPM. To do that you can:

#### Update NPM
```$ npm install -g npm```

or

#### Do a fresh NodeJS install
If you have issues to update NPM, you can just go to the [NodeJS](http://nodejs.org/) download the current version. It will come with the latest NPM version.


### The browser just does not start. What's going on?
It's more likely Karma can't find the location of the browser binary (the execution file). You can fix this by setting
the appropriate environment variable with the correct path (Google Chrome, for instance, uses the `CHROME_BIN` environment variable).
Check out [browsers] for more information.


### I'm getting a weird error from the browser, how can I debug it?
Go to the captured browser and click the "DEBUG" button (or open `http://localhost:9876/debug.html`)
and use the web inspector to see what's going on. (You may need to refresh the debug.html page for it to kick in once
the web inspector is open.)


### I'm getting a syntax error from a HTML file. It looks like the preprocessor isn't working.
The patterns in the `preprocessors` configuration setting are resolved via the `basePath` setting.
See preprocessors for more information. You can also turn on debug logging (use `--log-level debug` when starting Karma)
and Karma will display which files are preprocessed.


### I'm getting a `npm ERR! peerinvalid Peer` error. How can I fix that?
Try to remove `karma` and `karma-*` modules from your `node_modules` first (for instance `rm -rf /usr/local/lib/node_modules/karma-*`), then install Karma again.


### My tests are running really slow. What's going on?
Make sure the Karma's tab is active. Browsers give inactive tabs only minimum CPU.

Note: If you can't find the solution for your issue here you can also ask for help in the [mailing-list](https://groups.google.com/d/forum/karma-users) or [Stack Overflow](http://stackoverflow.com/questions/tagged/karma-runner).

### I'm really stuck. I tried every thing!
Because of the complexity of test setups, we rarely work to fix bugs without steps to reproduce. The best approach is to create a github project that installs all the components and reproduces the bug.

