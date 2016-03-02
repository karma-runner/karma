[Cloud9 IDE] is an open source web-based cloud integrated development environment that supports
several programming languages, with a focus on the web stack (specifically JavaScript and NodeJS).
It is written almost entirely in JavaScript and uses NodeJS on the back-end.

## Configuration

First, make sure the `karma.conf.js` includes the following entries:

```javascript
hostname: process.env.IP,
port: process.env.PORT
```

## Capture the browser manually on the local machine

You can use any of your local browsers.

```bash
# Start Karma without browsers:
$ karma start --no-browsers
```

Now, open `http://<projectName>.<cloud9User>.c9.io/` in your browser.

## Run Karma unit tests with PhantomJS

It is also possible to run headless PhantomJS on the Cloud9 server.

```bash
# Install the PhantomJS plugin:
$ npm install karma-phantomjs-launcher

# Start Karma:
$ karma start --browsers PhantomJS
```

[Cloud9 IDE]: https://c9.io/
