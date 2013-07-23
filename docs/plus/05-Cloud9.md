[Cloud9 IDE] is an open source web-based cloud integrated development environment that supports several programming languages, with a focus on the web stack (specifically JavaScript and [NodeJS]). It is written almost entirely in JavaScript, and uses [NodeJS] on the back-end.


There are two possibilities in order to run unit tests with Karma in [Cloud9 IDE]:

## Capture the browser manually on the local machine

Open `http://<projectName>.<cloud9User>.c9.io/` in your browser.

## Run Karma unit tests with PhantomJS in cloud9 IDE

### Install PhantomJS
PhantomJS must be installed with `npm install phantomjs`.

### Configure Karma
The `karma.conf.js` file must include the following entries:

```javascript
browsers: ['PhantomJS'],
hostname: process.env.IP,
port: process.env.PORT
```

[Cloud9 IDE]: https://c9.io/
[NodeJS]: http://nodejs.org/
