[Cloud9 IDE] is an open source web-based cloud integrated development environment that supports several programming languages, with a focus on the web stack (specifically JavaScript and [NodeJS]). It is written almost entirely in JavaScript, and uses [NodeJS] on the back-end.


There are 2 possibilities in order to run unit tests with testacular in [Cloud9 IDE]:

## Capture the browser manually on the local machine

Open `http://<projectName>.<cloud9User>.c9.io/` in your browser.

## Run testacular unit tests with PhantomJS in cloud9 IDE

### Install PhantomJS
PhantomJS must be installed with `npm install phantomjs`.

### Configure Testacular
The `testacular.conf.js` file (tried it out for the [AngularJS foodme app]) must include the following entries:

```javascript
browsers = ['PhantomJS'];
hostname = process.env.IP;
port = process.env.PORT;
runnerPort = 0;
```

[Cloud9 IDE]: https://c9.io/
[AngularJS foodme app]: https://github.com/IgorMinar/foodme
[NodeJS]: http://nodejs.org/
