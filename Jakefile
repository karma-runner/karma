var child = require('child_process');

var plainError = function(msg) {
  var e = new Error(msg);
  e.stack = '';
  return e;
};

var ENV = {
  env: process.env,
  cwd: __dirname
};

var ASYNC = {
  async: true
};


desc('Run all tests.');
task('test', ['test:unit', 'test:client'], function() {});

namespace('test', function() {
  desc('Run unit tests.');
  task('unit', function() {
    var jasmine = child.spawn('jasmine-node', ['--coffee', 'test/unit'], ENV);

    jasmine.stdout.pipe(process.stdout);
    jasmine.stderr.pipe(process.stderr);

    jasmine.on('exit', function(code) {
      if (code) fail(plainError('Unit tests failed.'), code);
      complete();
    });
  }, ASYNC);


  // TODO(vojta): make it nicer, timeouts, handle errors, etc
  desc('Run client unit tests.');
  task('client', function() {
    var BROWSER_CMD = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
    var server, browser;

    server = child.spawn('node', ['bin/testacular', 'test/client/testacular.conf'], ENV);

    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);

    server.stdout.on('data', function(buffer) {
      if (buffer.toString().indexOf('Connected on socket') !== -1) {
        child.exec('node bin/testacular-run', function(error, stdout, stderr) {
          browser.kill();
          server.kill();
          if (error) fail(plainError('Client tests failed.'), 1);
          complete();
        });
      }

      if (!browser) {
        browser = child.spawn(BROWSER_CMD, ['--user-data-dir=tmp', '--disable-metrics',
            '--no-first-run', '--no-default-browser-checkck', 'http://localhost:8080']);
      }
    });
  }, ASYNC);
});


desc('Build all.');
task('build', ['build:jasmine-adapter', 'build:client'], function() {});

namespace('build', function() {

  desc('Build testacular client.');
  task('client', function() {
    jake.exec([
      'sed -e "/%CONTENT%/r static/testacular.src.js" -e "/%CONTENT%/d" static/testacular.wrapper > static/testacular.js'
    ], function () {
      console.log('Build static/testacular.js');
      complete();
    });
  });


  desc('Build jasmine adapter.');
  task('jasmine-adapter', function() {
    jake.exec([
      'sed -e "/%CONTENT%/r adapter/jasmine.src.js" -e "/%CONTENT%/d" adapter/jasmine.wrapper > adapter/jasmine.js'
    ], function () {
      console.log('Build adapter/jasmine.js');
      complete();
    });
  });
});


desc('Bump minor version, update changelog, create tag, push to github.');
task('version', function () {
  var fs = require('fs');

  var packagePath = process.cwd() + '/package.json';
  var pkg = JSON.parse(fs.readFileSync(packagePath).toString());
  var versionArray = pkg.version.split('.');
  var previousVersionTag = 'v' + pkg.version;

  // bump minor version
  versionArray.push(parseInt(versionArray.pop(), 10) + 1);
  pkg.version = versionArray.join('.');

  // Update package.json with the new version-info
  fs.writeFileSync(packagePath, JSON.stringify(pkg, true, 2));

  var TEMP_FILE = '.changelog.temp';
  var message = 'Bump version to v' + pkg.version;
  jake.exec([
    // update changelog
    'echo "### v' + pkg.version + '" > ' + TEMP_FILE,
    'git log --pretty=%s ' + previousVersionTag + '..HEAD >> ' + TEMP_FILE,
    'echo "" >> ' + TEMP_FILE,
    'mvim CHANGELOG.md -c ":0r ' + TEMP_FILE + '"',
    'rm ' + TEMP_FILE,

    // commit + push to github
    'git commit package.json CHANGELOG.md -m "' + message + '"',
    'git push origin master',
    'git tag -a v' + pkg.version + ' -m "Version ' + pkg.version + '"',
    'git push --tags'
  ], function () {
    console.log(message);
    complete();
  });
});


desc('Build, bump version, publish to npm.');
task('publish', ['version', 'build'], function() {
  jake.exec([
    'npm publish'
  ], function() {
    console.log('Published to npm');
    complete();
  })
});


desc('Run JSLint check.');
task('jsl', function() {
  jake.exec(['jsl -conf jsl.conf'], complete, {stdout: true});
});
