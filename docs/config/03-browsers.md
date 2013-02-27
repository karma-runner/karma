## Starting browsers
Capturing browsers is kinda boring, so Testacular can do that for you.
Just simply add into the configuration file:

```javascript
browsers = ['Chrome'];
```
Then, Testacular will take care of autocapturing these browsers, as
well as killing them.

Currently available browsers:

* Chrome
* ChromeCanary
* Safari
* Firefox
* Opera
* PhantomJS
* IE


## Correct path to browser binary
Testacular has some default paths, where to find these browsers.
Check out
[launchers]
to see them.

You can override these settings by `<BROWSER>_BIN` ENV variable,
or alternatively by creating a `symlink`.

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
// in the testacular.conf.js
browsers = ['/usr/local/bin/custom-browser.sh'];

// from cli
testacular start --browsers /usr/local/bin/custom-browser.sh
```
The browser scripts need to take one argument, the url with id
parameter to be used to connect to the server. The supplied id is used
by the server to determine when the specific browser is captured.


[launchers]: https://github.com/testacular/testacular/blob/master/lib/launchers
