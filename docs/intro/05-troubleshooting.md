pageTitle: Troubleshooting
menuTitle: Troubleshooting

Here you'll find a list of the most common problems and how to solve it.

Note: If you can't find the solution for your issue here you can also ask for help in the [mailing-list](https://groups.google.com/d/forum/karma-users) or [Stack Overflow](http://stackoverflow.com/questions/tagged/karma-runner).

### The browser just does not start. What's going on?
It's more likely Karma can't find the location of the browser binary (the execution file). You can fix this by setting
the appropriate environment variable with the correct path (Google Chrome for instance uses the `CHROME_BIN` environment variable).
Check out [browsers] for more information.


### I'm getting a weird error from the browser, how can I debug it ?
Go to the captured browser and click the "DEBUG" button (or open `http://localhost:9876/debug.html`)
and use the web inspector to see what's going on. (You may need to refresh the debug.html page for it to kick in once
the web inspector is open.)


### I'm getting a syntax error from a HTML file. It looks like the preprocessor isn't working.
The patterns in the `preprocessors` configuration setting are resolved via the `basePath` setting.
See preprocessors for more information. You can also turn on debug logging (use `--log-level debug` when starting Karma)
and Karma will display which files are preprocessed.


### I'm getting a `npm ERR! peerinvalid Peer` error. How can I fix that ?
Try to remove `karma` and `karma-*` modules from your `node_modules` first (for instance `rm -rf /usr/local/lib/node_modules/karma-*`), than install Karma again.


### My tests are running really slow. What's going on?
Make sure the Karma's tab is active. Browsers give inactive tabs only minimum CPU.