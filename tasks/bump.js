module.exports = function(grunt) {

  var exec = require('child_process').exec;
  var changelog = require('./lib/changelog');

  /**
   * Bump version
   *  - increase version
   *  - generate changelog
   *  - create tag
   *  - push to github
   *
   *
   * grunt bump
   * grunt bump:patch
   * grunt bump:minor
   * grunt bump:major
   */
  grunt.registerTask('bump', 'Increment version, generate changelog, create tag and push to github.', function(type) {

    var finish = this.async();
    var queue = [];
    var next = function() {
      var cmd = queue.shift();

      if (!cmd) {
        return finish();
      }

      exec(cmd[0], function(err, output) {
        if (err) {
          return grunt.fail.fatal(err.message.replace(/\n$/, '.'));
        }
        if (cmd[1]) {
          grunt.log.ok(cmd[1]);
        }
        if (cmd[2]) {
          cmd[2](output);
        }
        next();
      });
    };

    var run = function(cmd, msg, fn) {
      queue.push([cmd, msg, fn]);
    };


    // increment the version
    var pkg = grunt.file.readJSON(grunt.config('pkgFile'));
    var previousVersion = pkg.version;
    var newVersion = pkg.version = bumpVersion(previousVersion, type);

    // write updated package.json
    grunt.file.write(grunt.config('pkgFile'), JSON.stringify(pkg, null, '  ') + '\n');
    grunt.log.ok('Version bumped to ' + newVersion);

    // generate changelog
    changelog.generate('v' + newVersion).then(function(data) {
      grunt.file.write('CHANGELOG.md', data + grunt.file.read('CHANGELOG.md'));
      next();
    });

    run('sublime -w CHANGELOG.md', 'CHANGELOG.md updated');
    run('git commit package.json CHANGELOG.md -m "chore: release v' + newVersion + '"', 'Changes committed');
    run('git tag -a v' + newVersion + ' -m "Version ' + newVersion + '"', 'New tag "v' + newVersion + '" created');
    run('git push upstream master --tags', 'Pushed to github');
  });


  var bumpVersion = function(version, versionType) {
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    var parts = version.split('.');
    var idx = type[versionType || 'patch'];

    parts[idx] = parseInt(parts[idx], 10) + 1;
    while(++idx < parts.length) {
      parts[idx] = 0;
    }
    return parts.join('.');
  };
};
