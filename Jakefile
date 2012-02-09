desc('Run all tests.');
task('test', ['test:unit'], function() {});

namespace('test', function() {
  desc('Run unit tests.');
  task('unit', function() {
    console.log('Running unit tests...');
    jake.exec(['jasmine-node --coffee test/unit'], complete, {stdout: true});
  });
});


desc('Build all.');
task('build', ['build:jasmine-adapter'], function() {});

namespace('build', function() {

  desc('Build jasmine adapter.');
  task('jasmine-adapter', function() {
    jake.exec([
      'cat adapter/prefix adapter/jasmine.src.js adapter/suffix > adapter/jasmine.js'
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
    'git tag -a v' + pkg.version + ' -m "Version to v' + pkg.version + '"',
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
