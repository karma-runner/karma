module.exports = function(grunt) {

  var exec = require('child_process').exec;

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

      if (!cmd) return finish();

      exec(cmd[0], function(err, output) {
        if (err) return grunt.fail.fatal(err.message.replace(/\n$/, '.'));
        if (cmd[1]) grunt.log.ok(cmd[1]);
        if (cmd[2]) cmd[2](output);
        next();
      });
    };

    var run = function(cmd, msg, fn) {
      queue.push([cmd, msg, fn]);
    };


    // increment the version
    var PKG_FILE = 'package.json';
    var pkg = grunt.file.readJSON(PKG_FILE);
    var previousVersion = pkg.version;
    var newVersion = pkg.version = grunt.helper('bump_version', previousVersion, type);

    // write updated package.json
    grunt.file.write(PKG_FILE, JSON.stringify(pkg, null, '  '));
    grunt.log.ok('Version bumped to ' + newVersion);

    // generate changelog
    run('git log --grep="\\[changelog\\]" --pretty="* %s" v' + previousVersion + '..HEAD', null, function(log) {
      var title = '### v' + newVersion + '\n';
      var changelog = grunt.file.read('CHANGELOG.md');
      grunt.file.write('CHANGELOG.md', title + log + '\n' + changelog);
    });

    run('sublime -w CHANGELOG.md', 'CHANGELOG.md updated');
    run('git commit package.json CHANGELOG.md -m "Version ' + newVersion + '"', 'Changes committed');
    run('git tag -a v' + newVersion + ' -m "Version ' + newVersion + '"', 'New tag "v' + newVersion + '" created');
    run('git push origin master --tags', 'Pushed to github');
    next();
  });


  grunt.registerHelper('bump_version', function(version, versionType) {
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
  });
};
