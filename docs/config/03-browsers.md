Capturing browsers on your own can be a tedious and time-consuming task. However, Karma can automate this for you. Simply add the browsers you would like to capture into the [configuration file].

```javascript
browsers: ['Chrome']
```

Then, Karma will take care of auto-capturing these browsers, as well as killing them after the job is over.

Note: Most of the browser launchers need to be loaded as [plugins].

## Available browser launchers
- [Chrome and Chrome Canary](https://www.npmjs.com/package/karma-chrome-launcher)
- [Firefox](https://www.npmjs.com/package/karma-firefox-launcher)
- [Safari](https://www.npmjs.com/package/karma-safari-launcher)
- [PhantomJS](https://www.npmjs.com/package/karma-phantomjs-launcher)
- [JSDOM](https://www.npmjs.com/package/karma-jsdom-launcher)
- [Opera](https://www.npmjs.com/package/karma-opera-launcher)
- [Internet Explorer](https://www.npmjs.com/package/karma-ie-launcher)
- [SauceLabs](https://www.npmjs.com/package/karma-saucelabs-launcher)
- [BrowserStack](https://www.npmjs.com/package/karma-browserstack-launcher)
- [many more](https://www.npmjs.org/browse/keyword/karma-launcher)

Here's an example of how to add Firefox to your testing suite:

```bash
# Install the launcher first with NPM:
$ npm install karma-firefox-launcher --save-dev
```

And then, inside your configuration file, add the browser name in `browsers` array.

```javascript
module.exports = function(config) {
  config.set({
    browsers : ['Chrome', 'Firefox']
  });
};
```

Also, keep in mind that the `browsers` configuration setting is empty by default.

Of course, you can write [custom plugins] too!

## Capturing any browser manually

You can also capture browsers by simply opening `http://<hostname>:<port>/`, where `<hostname>` is the IP
address or hostname of the machine where the Karma server is running and `<port>` is the port where the Karma
server is listening (by default it's `9876`). With the default settings in place, just point your browser to `http://localhost:9876/`.

This allows you to capture a browser on any device, such as a tablet or a phone, that is on the same network
as the machine running Karma (or using a local tunnel).


## Configured launchers
Some of the launchers can also be configured:

```javascript
sauceLabs: {
  username: 'michael_jackson'
}
```

Or defined as a configured launcher:

```javascript
customLaunchers: {
  chrome_without_security: {
    base: 'Chrome',
    flags: ['--disable-web-security']
  },
  sauce_chrome_win: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'windows'
  }
}
```

A display name can be set for any custom launcher. If set, this name will be used for reporting instead of the
user agent. Here is a code snippet example explaining how to set a display name for a custom launcher.

```javascript
customLaunchers: {
  chrome_without_security: {
    base: 'Chrome',
    flags: ['--disable-web-security'],
    displayName: 'Chrome w/o security'
  }
}
```

If the definition is as above, the browser will be displayed as `Chrome w/o security` in logs and reports.

## Correct path to browser binary
Each plugin has some default paths where to find the browser binary on particular OS.
You can override these settings by `<BROWSER>_BIN` ENV variable, or alternatively by creating a `symlink`.

### POSIX shells
```bash
# Changing the path to the Chrome binary
$ export CHROME_BIN=/usr/local/bin/my-chrome-build

# Changing the path to the Chrome Canary binary
$ export CHROME_CANARY_BIN=/usr/local/bin/my-chrome-build

# Changing the path to the PhantomJs binary
$ export PHANTOMJS_BIN=$HOME/local/bin/phantomjs
```

### Windows cmd.exe
```bash
C:> SET IE_BIN=C:\Program Files\Internet Explorer\iexplore.exe
```

### Windows Powershell
```bash
$Env:FIREFOX_BIN = 'c:\Program Files (x86)\Mozilla Firefox 4.0 Beta 6\firefox.exe'
```

## Custom browsers
```javascript
// in the karma.conf.js
browsers: ['/usr/local/bin/custom-browser.sh'],

// from cli
karma start --browsers /usr/local/bin/custom-browser.sh
```
The browser scripts need to take one argument, which is the URL with the ID-parameter to be used to connect to the server. The supplied ID is used by the server to keep track of which specific browser is captured.



[Chrome and Chrome Canary]: https://github.com/karma-runner/karma-chrome-launcher
[PhantomJS]: https://github.com/karma-runner/karma-phantomjs-launcher
[JSDOM]: https://github.com/badeball/karma-jsdom-launcher
[Firefox]: https://github.com/karma-runner/karma-firefox-launcher
[Safari]: https://github.com/karma-runner/karma-safari-launcher
[IE]: https://github.com/karma-runner/karma-ie-launcher
[Opera]: https://github.com/karma-runner/karma-opera-launcher
[SauceLabs]: https://github.com/karma-runner/karma-sauce-launcher
[BrowserStack]: https://github.com/karma-runner/karma-browserstack-launcher
[custom plugins]: ../dev/plugins.html
[plugins]: plugins.html
[configuration file]: configuration-file.html
