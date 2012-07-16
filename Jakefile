var child = require('child_process');

var plainError = function(msg) {
  var e = new Error(msg);
  e.stack = '';
  return e;
};

var header = function(msg) {
  console.log('');
  console.log('================================================================================');
  console.log(msg);
  console.log('================================================================================');
};

var ENV = {
  env: process.env,
  cwd: __dirname
};

var ASYNC = {
  async: true
};

var BROWSER_CMD, BROWSER_ARGS, BROWSERS;
if (process.env.TRAVIS) {
  BROWSER_CMD = '/usr/bin/firefox';
  BROWSER_ARGS = ['http://localhost:8080'];
  BROWSERS = 'Firefox';
} else {
  BROWSER_CMD = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
  BROWSER_ARGS = ['--user-data-dir=tmp', '--disable-metrics', '--no-first-run',
                  '--no-default-browser-checkck', 'http://localhost:8080'];
  BROWSERS = 'Chrome,ChromeCanary,Firefox,Opera,Safari,PhantomJS';
}

desc('Run all tests.');
task('test', ['test:unit', 'test:client', 'test:client2'], function() {});

namespace('test', function() {
  desc('Run unit tests.');
  task('unit', function() {
    header('Running nodejs unit tests...');

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
  task('client2', ['build'], function() {
    header('Running client tests in a browser...');

    var server, browser, timeout, runner;

    server = child.spawn('node', ['bin/testacular', 'test/client/config.js'], ENV);

    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);

    server.stdout.on('data', function(buffer) {
      if (!runner && buffer.toString().indexOf('Connected on socket') !== -1) {
        runner = child.exec('node bin/testacular-run', function(error, stdout, stderr) {
          browser.kill();
          server.kill();

          if (timeout) clearTimeout(timeout);
          if (error) fail(plainError('Client tests failed.'), 1);
          complete();
        });
      }

      if (!browser) {
        browser = child.spawn(BROWSER_CMD, BROWSER_ARGS);
        browser.on('exit', function() {
          child.exec('rm -rdf tmp');
        });
      }
    });

    timeout = setTimeout(function() {
      fail(plainError('Time-outed after 30s.'), 1);
    }, 30000);
  }, ASYNC);


  desc('Run client unit tests using single run mode.');
  task('client', ['build'], function() {
    header('Running client tests in a browser using single run mode...');

    var timeout, server;

    server = child.spawn('node', ['bin/testacular', 'test/client/config.js', '--browsers', BROWSERS, '--single-run'], ENV);
    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);

    server.on('exit', function(code) {
      if (timeout) clearTimeout(timeout);

      if (code) {
        fail(plainError(''), code);
      }
      complete();
    });

    timeout = setTimeout(function() {
      fail(plainError('Time-outed after 30s.'), 1);
    }, 30000);
  }, ASYNC);
});


desc('Build all.');
task('build', ['build:jasmine-adapter', 'build:client'], function() {});

namespace('build', function() {

  desc('Build testacular client.');
  task('client', function() {
    header('Building static/testacular.js...');

    jake.exec([
      'sed -e "/%CONTENT%/r static/testacular.src.js" -e "/%CONTENT%/d" static/testacular.wrapper > static/testacular.js'
    ], function () {
      console.log('Successfully build.');
      complete();
    });
  }, ASYNC);


  desc('Build jasmine adapter.');
  task('jasmine-adapter', function() {
    header('Building adapter/jasmine.js...');

    jake.exec([
      'sed -e "/%CONTENT%/r adapter/jasmine.src.js" -e "/%CONTENT%/d" adapter/jasmine.wrapper > adapter/jasmine.js'
    ], function () {
      console.log('Successfully build.');
      complete();
    });
  }, ASYNC);
});


desc('Bump minor version, update changelog, create tag, push to github.');
task('version', function () {
  header('Bumping version...');

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
    'git log --grep="\\[changelog\\]" --pretty=%s ' + previousVersionTag + '..HEAD >> ' + TEMP_FILE,
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
}, ASYNC);


desc('Build, bump version, publish to npm.');
task('publish', ['version', 'build'], function() {
  header('Publishing to npmjs.org...');

  jake.exec([
    'npm publish'
  ], function() {
    console.log('Published to npm');
    complete();
  });
}, ASYNC);


desc('Run JSLint check.');
task('jsl', function() {
  jake.exec(['jsl -conf jsl.conf'], complete, {stdout: true});
}, ASYNC);


desc('Show npm package content.');
task('npm-check', function() {
  header('Show content of npm package if published...');

  child.exec('npm pack', function(err, pkgFile) {
    child.exec('tar -tf ' + pkgFile, function(err, pkgContent) {
      console.log(pkgContent);
      child.exec('rm ' + pkgFile, complete);
    });
  });
}, ASYNC);
