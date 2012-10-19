module.exports = function(grunt) {
  var exec = require('child_process').exec;
  var git = require('git');
  /**
   * Publish
   *  - generate changelog
   *  - create tag
   *  - push to github
   *
   *
   * grunt publish
   * grunt publish:patch
   * grunt publish:minor
   * grunt publish:major
   */
  grunt.registerTask('publish', 'Generate changelog, create tag and push to github.', function(type){
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

    
    // read the package version
    var PKG_FILE = 'package.json';
    var pkg = grunt.file.readJSON(PKG_FILE);
    var version = pkg.version;
    var previousVersion = grunt.helper('unbump_version', version, type);

    // generate changelog
    run('git log --grep="\\[changelog\\]" --pretty="* %s" v' + previousVersion + '..HEAD', null, function(log) {
      var title = '### v' + version + '\n';
      var changelog = grunt.file.read('CHANGELOG.md');
      grunt.file.write('CHANGELOG.md', title + log + '\n' + changelog);
    });

    run('sublime -w CHANGELOG.md', 'CHANGELOG.md updated');
    run('git commit package.json CHANGELOG.md -m "Version ' + version + '"', 'Changes committed');
    run('git tag -a v' + version + ' -m "Version ' + version + '"', 'New tag "v' + version + '" created');
    run('git push origin master --tags', 'Pushed to github');

    next();
  });
  
  grunt.registerHelper('unbump_version', function(version, versionType){
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    var parts = version.split('.');
    var idx = type[versionType || 'patch'];
    
    parts[idx] = parseInt(parts[idx], 10) - 1;
    return parts.join('.');
  });
};
