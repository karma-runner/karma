module.exports = function(grunt) {

  /**
   * Bump version
   *  - increase version in package.json
   *  - increase version in docs/conf.py
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
    var newVersion = grunt.helper('bump_version', previousVersion, type);

    grunt.helper('bump_pkg', newVersion);
    grunt.helper('bump_docs', newVersion);
    grunt.helper('changelog', previousVersion, newVersion);
    grunt.helper('publish', newVersion);
  });

  // TODO(vojta): update grunt.config('pkg') as well,
  // currently running grunt bump xxx (xxx still see old version)
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

  // bump version in package.json
  grunt.registerHelper('bump_pkg', function(version){
    pkg.version = version;
    grunt.file.write(PKG_FILE, JSON.stringify(pkg, null, '  '));
    grunt.log.ok('Version bumped to ' + version);

  });

  // bump version in docs/conf.py
  grunt.registerHelper('bump_docs', function(version){
    version = version.split('.').slice(0,2).join('.');
    var release = newVersion;
    var DOCS_FILE = 'docs/conf.py';
    var docs = grunt.file.read(DOCS_FILE);
    
    var replaceVersion = function(version){
      return function(match, oldVersion){
        return match.replace(oldVersion, version);
      };
    };
    
    docs = docs.replace(/version = '([0-9\.]*)'/, replaceVersion(version));
    docs = docs.replace(/release = '([0-9\.]*)'/, replaceVersion(release));
    
    // write updated conf.py 
    grunt.file.write(DOCS_FILE, docs);
    
    grunt.log.ok('Version updated to ' + docs.match(/version = '([0-9\.]*)'/)[1]);
    grunt.log.ok('Release updated to ' + docs.match(/release = '([0-9\.]*)'/)[1]);

  });

  // generate the changelog and commit it to git
  grunt.registerHelper('changelog', function(previousVersion, version){
    run('git log --grep="\\[changelog\\]" --pretty="* %s" v' + previousVersion + '..HEAD', null, function(log) {
      var title = '### v' + version + '\n';
      var changelog = grunt.file.read('CHANGELOG.md');
      grunt.file.write('CHANGELOG.md', title + log + '\n' + changelog);
    });

    run('sublime -w CHANGELOG.md', 'CHANGELOG.md updated');


  });

  // create a tag and push to master
  grunt.registerHelper('publish', function(version){
    run('git commit package.json CHANGELOG.md -m "Version ' + version + '"', 'Changes committed');
    run('git tag -a v' + version + ' -m "Version ' + version + '"', 'New tag "v' + version + '" created');
    run('git push origin master --tags', 'Pushed to github');
    
  });
};
