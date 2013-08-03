Capturing browsers is kinda boring, so Karma can do that for you.
Just simply add into the configuration file:

```javascript
browsers: ['Chrome']
```

Then, Karma will take care of autocapturing these browsers, as well as killing them.

Note: Most of the browser launchers needs to be loaded as [plugins].

## Available browser launchers
These launchers are shipped with Karma by default:
- [Chrome and Chrome Canary]
- [PhantomJS]

Additional launchers can be loaded through [plugins], such as:
- [Firefox]
- [Safari]
- [Opera]
- [IE]

Of course, you can write [custom plugins] too!

## Capturing any browser manually

You can also capture browsers by simply opening `http://<hostname>:<port>/`, where `<hostname>` is the IP address or hostname of the machine where Karma server is running and `<port>` is the port where Karma server is listening (by default it's `9876`).

This allows you to capture a browser on any device such as a tablet or a phone, that is on the same network as the machine running Karma (or using a local tunnel).


## Configured launchers
Some of the launchers can be also configured:

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
The browser scripts need to take one argument, the url with id
parameter to be used to connect to the server. The supplied id is used
by the server to determine when the specific browser is captured.



[Chrome and Chrome Canary]: https://github.com/karma-runner/karma-chrome-launcher
[PhantomJS]: https://github.com/karma-runner/karma-phantomjs-launcher
[Firefox]: https://github.com/karma-runner/karma-firefox-launcher
[Safari]: https://github.com/karma-runner/karma-safari-launcher
[IE]: https://github.com/karma-runner/karma-ie-launcher
[Opera]: https://github.com/karma-runner/karma-opera-launcher
[SauceLabs]: https://github.com/karma-runner/karma-sauce-launcher
[custom plugins]: ../dev/plugins.html
[plugins]: plugins.html
